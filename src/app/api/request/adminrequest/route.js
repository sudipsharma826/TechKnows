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
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
});

// Helper function to get or create the dynamic model
function getAdminModel(collectionName) {
  return mongoose.models[collectionName] || mongoose.model(collectionName, adminSchema, collectionName);
}

// Standardized response helper
function createResponse(message, status = 200) {
  return new Response(
    JSON.stringify({ message }),
    { status, headers: { "Content-Type": "application/json" } }
  );
}

function createErrorResponse(error, status = 400) {
  return new Response(
    JSON.stringify({ error }),
    { status, headers: { "Content-Type": "application/json" } }
  );
}

// PUT request to handle admin actions (approve, reject, enable, disable)
export async function PUT(req) {
  const { requestId, action } = await req.json();

  if (!requestId || !action) {
    return createErrorResponse("requestId and action are required", 400);
  }

  try {
    await connect(); // Connect to MongoDB

    const request = await Request.findById(requestId);
    if (!request) {
      return createErrorResponse("Request not found", 404);
    }

    const user = await User.findById(request.requestedBy);
    if (!user) {
      return createErrorResponse("User not found", 404);
    }

    const adminCollectionName = `admin_${user._id}`;
    const AdminModel = getAdminModel(adminCollectionName);

    switch (action) {
      case "approved":
        request.status = "approved";
        await request.save();

        let adminDoc = await AdminModel.findOne({ userId: user._id });
        if (!adminDoc) {
          adminDoc = new AdminModel({
            name: user.displayName,
            email: user.email,
            userId: user._id,
            posts: [],
          });
          await adminDoc.save();
        }

        await User.findByIdAndUpdate(user._id, { role: "admin" });

        return createResponse("Request approved.", 200);

      case "rejected":
        request.status = "rejected";
        await request.save();

        return createResponse("Request rejected.", 200);

      default:
        return createErrorResponse("Invalid action", 400);
    }
  } catch (error) {
    console.error("Error during PUT request:", error);
    return createErrorResponse("An error occurred", 500);
  }
}

// POST request to approve or reject the admin request
export async function POST(req) {
  try {
    const { userId, requestType, description } = await req.json();

    if (!userId || !requestType || !description) {
      return createErrorResponse("userId, requestType, and description are required", 400);
    }

    await connect(); // Connect to MongoDB

    const newRequest = new Request({
      requestedDate: new Date(),
      requestedBy: userId,
      requestType,
      description,
      status: "pending",
      checkedBy: null,
      checkedDate: null,
    });

    await newRequest.save();

    return createResponse("Request submitted successfully", 200);
  } catch (error) {
    console.error("Error during request submission:", error);
    return createErrorResponse("Error during request submission", 500);
  }
}
