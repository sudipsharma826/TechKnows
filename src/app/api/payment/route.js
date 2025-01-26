import connect from "@/lib/mongodb/mongoose";
import Payment from "@/lib/models/paymentModel";
import User from "@/lib/models/userModel";

export async function POST(req) {
  await connect();

  try {
    const { amount, userId, packageId, order_id } = await req.json();

    // Validate required fields
    if (!amount || !userId || !packageId || !order_id) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Get user details from the database
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
        website_url: `${process.env.BASE_URL}`,
        amount: amount * 100, // Convert to paisa
        purchase_order_id: order_id,
        purchase_order_name: "Subscription",
        customer_info: {
          name: user.displayName,
          email: user.email,
        },
      }),
    });

    const khaltiData = await khaltiResponse.json();

    if (khaltiResponse.ok && khaltiData.pidx) {
      // Save payment details to the database with "pending" status
      await Payment.create({
        order_id: order_id,
        epayment_id: khaltiData.pidx,
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
          paymentUrl: khaltiData.payment_url,
        }),
        { status: 201 }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: khaltiData.detail || "Failed to initiate payment",
        }),
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

//Get Payment details
export async function PATCH(req) {
  await connect();

  try {
    const { userId } = await req.json();
    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, message: "User ID is required" }),
        { status: 400 }
      );
    }

    //Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found" }),
        { status: 404 }
      );
    }
    //Check if use is superamin ( to get all payments)
    if (user.role === "superadmin") {
      const payments = await Payment.find();
      return new Response(JSON.stringify({ success: true, data: payments }), { status: 200 });
    }

    //Of rother paymnet deatils with its uerID
    if (user.role !== "superadmin") {
      const payments = await Payment.find({ userId });
      return new Response(JSON.stringify({ success: true, data: payments }), { status: 200 });
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message || "Internal Server Error" }),
      { status: 500 }
    );
  }
}
