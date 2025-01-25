import connect from "@/lib/mongodb/mongoose";
import Payment from "@/lib/models/paymentModel";
import Package from "@/lib/models/packageModel";
import User from "@/lib/models/userModel";

export async function GET(req) {
  try {
    // Ensure database connection
    await connect();

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const pidx = searchParams.get("pidx");
    const status = searchParams.get("status");
    const purchase_order_id = searchParams.get("purchase_order_id");

    // Validate required parameters
    if (!pidx || !status || !purchase_order_id) {
      console.error("Missing required query parameters");
      return new Response("Missing query parameters", { status: 400 });
    }

    // Validate environment variable
    const secretKey = process.env.KHALTI_SECRET_KEY;
    if (!secretKey) {
      console.error("Khalti secret key is missing in environment variables");
      return new Response("Server configuration error", { status: 500 });
    }

    // Verify payment using Khalti's lookup API
    const khaltiResponse = await fetch("https://dev.khalti.com/api/v2/epayment/lookup/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${secretKey}`,
      },
      body: JSON.stringify({ pidx }),
    });

    if (!khaltiResponse.ok) {
      console.error("Khalti API verification failed:", khaltiResponse.status);
      return new Response("Payment verification failed", { status: khaltiResponse.status });
    }

    const khaltiData = await khaltiResponse.json();
    console.log("Khalti verification response:", khaltiData);

    if (khaltiData.status === "Completed" && khaltiData.pidx === pidx) {
      // Update payment status and add to subscribedBy
      const payment = await Payment.findOneAndUpdate(
        { epayment_id: khaltiData.pidx },
        { status: "Completed" },
        { new: true }
      );

      if (!payment) {
        console.error("Payment not found for pidx:", pidx);
        return new Response("Payment not found", { status: 404 });
      }

      const packageId = payment.packageId;
      const userId = payment.userId;

      await Package.findByIdAndUpdate(
        packageId,
        { $addToSet: { subscribedBy: userId } },
        { new: true }
      );

      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { subscribedPackages: packageId } },
        { new: true }
      );

      console.log("Payment successfully verified and user updated");
      return new Response("", {
        status: 303,
        headers: { Location: "/" },
      });
    } else {
      console.error("Payment verification failed for pidx:", pidx);
      return new Response("Payment verification failed", { status: 400 });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
