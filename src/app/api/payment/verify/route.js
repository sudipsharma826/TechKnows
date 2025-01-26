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
      return new Response("Missing query parameters", { status: 400 });
    }

    // Verify payment using Khalti's lookup API
    const khaltiResponse = await fetch("https://a.khalti.com/api/v2/epayment/lookup/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      },
      body: JSON.stringify({ pidx }),
    });

    const khaltiData = await khaltiResponse.json();

    if (khaltiResponse.ok && khaltiData.status === "Completed" && khaltiData.pidx === pidx) {
      // Update payment status to "Completed"
      const payment = await Payment.findOneAndUpdate(
        { epayment_id: khaltiData.pidx },
        { status: "Completed" },
        { new: true }
      );

      if (!payment) {
        return new Response("Payment not found", { status: 404 });
      }

      const { packageId, userId } = payment;

      // Update package and user subscriptions
      await Package.findByIdAndUpdate(packageId, { $addToSet: { subscribedBy: userId } });
      await User.findByIdAndUpdate(userId, { $addToSet: { subscribedPackages: packageId } });

      return new Response("", {
        status: 302, // Redirect response
        headers: { Location: "/page/dashboard?tab=mypayment" },
      });
    } else {
      return new Response("", {
        status: 302,
        headers: { Location: "/" },
      });
    }
  } catch (error) {
    return new Response("Internal server error", { status: 500 });
  }
}
