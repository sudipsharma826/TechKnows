import connect from "../../../../lib/mongodb/mongoose";
import User from "../../../../lib/models/userModel"; // User model
import Request from "../../../../lib/models/requestModel"; // Request model
import mongoose from "mongoose";

// Dynamic Admin Schema
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  isActive: { type: Boolean, default: true },
});

// Helper function to get or create the dynamic model
function getAdminModel(collectionName) {
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName]; // Use the existing model
  }
  return mongoose.model(collectionName, adminSchema); // Create a new model
}

export async function POST(req, res) {
  try {
    const { userId, requestType, description } = await req.json();

    if (!userId || !requestType || !description) {
      return new Response(
        JSON.stringify({
          error: "userId, requestType, and description are required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Connect to the database
    await connect();

    // Create the new request entry using the Request model
    const newRequest = new Request({
      requestedDate: new Date(),
      requestedBy: userId,
      requestType,
      description,
      status: "pending",
      checkedBy: null,
      checkedDate: null,
    });

    // Save the new request to the database
    await newRequest.save();

    return new Response(
      JSON.stringify({ message: "Request submitted successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error during request submission:", error);
    return new Response(
      JSON.stringify({ error: "Error during request submission" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function PUT(req, res) {
  const { requestId, action } = await req.json();

  if (!requestId || !action) {
    return new Response(
      JSON.stringify({ error: "requestId and action are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    await connect(); // Connect to MongoDB

    // Fetch the request
    const request = await Request.findById(requestId);
    if (!request) {
      return new Response(
        JSON.stringify({ error: "Request not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch the user
    const user = await User.findById(request.requestedBy);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Handle actions
    const adminCollectionName = `admin_${user._id}`;
    const AdminModel = getAdminModel(adminCollectionName);

    switch (action) {
      case "approved":
        // Update the request status
        request.status = "approved";
        await request.save();

        // Add the user as an admin
        await AdminModel.create({
          name: user.displayName,
          email: user.email,
          userId: user._id,
        });

        return new Response(
          JSON.stringify({ message: "Request approved." }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );

      case "rejected":
        // Update the request status
        request.status = "rejected";
        await request.save();
        return new Response(
          JSON.stringify({ message: "Request rejected." }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );

      case "enable":
        // Enable the admin
        await AdminModel.updateMany({}, { isActive: true });
        return new Response(
          JSON.stringify({ message: "Admin enabled." }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );

      case "disable":
        // Disable the admin
        await AdminModel.updateMany({}, { isActive: false });
        return new Response(
          JSON.stringify({ message: "Admin disabled." }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Error during PUT request:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
