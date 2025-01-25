import connect from "@/lib/mongodb/mongoose";
import Payment from "@/lib/models/paymentModel";
import User from "@/lib/models/userModel";

export async function POST(req) {
  await connect();

  try {
    const { amount, userId, packageId, order_id } = await req.json();

    // Validate required fields
    if (!amount || !userId || !packageId) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required fields" }),
        { status: 400 }
      );
    }

    //Get user deatisl from the database
    const user = await User.findById(userId);
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found" }),
        { status: 404 }
      );
    }

    // Initiate payment with Khalti
    const khaltiResponse = await fetch("https://a.khalti.com/api/v2/epayment/initiate/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`, 
      },
      body: JSON.stringify({
        return_url: `${process.env.BASE_URL}/api/payment/verify`, 
        website_url: `${process.env.BASE_URL}/page/dashboard?tab=mypayment`, 
        amount: amount * 100, // Convert amount to paisa (1 rupee = 100 paisa)
        purchase_order_id: order_id, 
        purchase_order_name: "Subscription", 
        customer_info: {
          name: user.displayName, 
          email: user.email,
        },
      }),
    });

    const khaltiData = await khaltiResponse.json();

    if (khaltiData.pidx) { // Check if pidx (payment id) is present in the response
      // Save payment details to the database with "pending" status
      const newPayment = await Payment.create({
        order_id: order_id,
        epayment_id: khaltiData.pidx, // Store the correct pidx here
        amount,
        userId,
        packageId,
        paymentMethod: "Khalti",
        status: "pending",
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Payment initiated successfully",
          paymentUrl: khaltiData.payment_url, // Send the payment URL to the frontend
        }),
        { status: 201 }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, message: khaltiData.detail || "Failed to initiate payment" }),
        { status: 400 }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message || "Internal Server Error" }),
      { status: 500 }
    );
  }
}

// Get all payments based on user role
// Get all payments based on user role
export async function PATCH(req) {
  const { userId } = await req.json(); // Access the userId from the query parameter
  console.log("userId", userId);

  try {
    // Check if user exists
    await connect();
    const user = await User.findById({ _id: userId });
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found" }),
        { status: 404 }
      );
    }

    if (user.role === "superadmin") {
      // Get all payments for superadmin
      const payments = await Payment.find({}).populate("packageId").populate("userId");
      return new Response(
        JSON.stringify({ success: true, data: payments }),
        { status: 200 }
      );
    } else {
      // For other users, fetch payments related to their own userId
      const payments = await Payment.find({ userId }).populate("packageId");
      return new Response(
        JSON.stringify({ success: true, data: payments }),
        { status: 200 }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message || "Internal Server Error" }),
      { status: 500 }
    );
  }
}
