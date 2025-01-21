import connect from "../../../../lib/mongodb/mongoose";
import User from "../../../../lib/models/userModel"; // User model
import Request from "../../../../lib/models/requestModel"; // Request model
import mongoose from "mongoose";

// Dynamic Admin Schema with posts field
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  isActive: { type: Boolean, default: true },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }], // Include posts field
});

// Helper function to get or create the dynamic model
function getAdminModel(collectionName) {
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName]; // Use the existing model
  }
  return mongoose.model(collectionName, adminSchema, collectionName); // Create a new model
}

// PUT request to handle admin actions (approve, reject, enable, disable)
export async function PUT(req) {
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

        // Check if the admin document exists
        let adminDoc = await AdminModel.findOne({ userId: user._id });
        if (!adminDoc) {
          // Create the admin document if it doesn't exist
          adminDoc = new AdminModel({
            name: user.displayName,
            email: user.email,
            userId: user._id,
            posts: [], // Initialize with an empty array for posts
          });
          await adminDoc.save();
        }

        // Update the user role
        await User.findByIdAndUpdate(user._id, { role: "admin" });

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

      case "enabled":
        // Update the admin document
        await AdminModel.updateOne({ userId: user._id }, { isActive: true });
        await User.findByIdAndUpdate(user._id, { isActive: true });
        return new Response(
          JSON.stringify({ message: "Admin enabled." }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      case "disabled":
        // Update the admin document
        await AdminModel.updateOne({ userId: user._id }, { isActive: false });
        await User.findByIdAndUpdate(user._id, { isActive: false });
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


// POST request to approve or reject the admin request
export async function POST(req) {
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

