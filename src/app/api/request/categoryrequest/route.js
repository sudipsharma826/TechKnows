import connect from "../../../../lib/mongodb/mongoose";
import User from "../../../../lib/models/userModel"; // User model
import Request from "../../../../lib/models/requestModel"; // Request model
import Category from "../../../../lib/models/categoryModel"; // Category model

const createResponse = (data, status) => 
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

// Post Add Category Request
export async function POST(req) {
  try {
    await connect(); // Connect to MongoDB

    const { userId, categoryName, image, description } = await req.json();

    if (!userId || !categoryName || !image || !description) {
      return createResponse({ error: "Missing required fields" }, 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      return createResponse({ error: "User not found" }, 404);
    }

    if (user.role === "superadmin") {
      const categoryExists = await Category.findOne({ name: categoryName });
      if (categoryExists) {
        return createResponse({ error: "Category already exists" }, 400);
      }

      const newCategory = await Category.create({
        name: categoryName,
        image,
        description,
        postCount: 0,
        isApproved: true,
      });

      return createResponse({ message: "Category added successfully", category: newCategory }, 201);
    } else if (user.role === "admin") {
      const categoryExists = await Category.findOne({ name: categoryName });
      if (categoryExists) {
        return createResponse({ error: "Category already exists" }, 400);
      }

      const newRequest = await Request.create({
        requestDate: new Date(),
        requestType: "Category",
        description,
        status: "pending",
        requestedBy: userId,
        requestedFor: categoryName,
      });

      const newCategory = await Category.create({
        name: categoryName,
        image,
        description,
        postCount: 0,
        isApproved: false,
      });

      return createResponse(
        {
          message: "Category request created successfully",
          request: newRequest,
          category: newCategory,
        },
        201
      );
    } else {
      return createResponse(
        { error: "Only admins and superadmins can add categories" },
        403
      );
    }
  } catch (error) {
    console.error("Error adding category:", error);
    return createResponse({ error: "Internal server error", details: error.message }, 500);
  }
}

// Get all categories
export async function GET() {
  try {
    await connect();
    const categories = await Category.find().sort({ createdAt: -1 });
    return createResponse(categories, 200);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return createResponse({ error: "Internal server error", details: error.message }, 500);
  }
}

// Accept or reject category request
export async function PUT(req) {
  try {
    const { requestId, action } = await req.json();
    console.log("Request ID:", requestId, "Action:", action);

    if (!requestId || !action) {
      return createResponse({ error: "Missing required fields" }, 400);
    }

    await connect();

    const request = await Request.findById(requestId);
    if (!request) {
      return createResponse({ error: "Request not found" }, 404);
    }
    const category = await Category.findOne({ name: request.requestedFor });
    if (!category) {
      return createResponse({ error: "Category not found" }, 404);
    }

    switch (action) {
      case "approved":
        request.status = "approved";
        category.isApproved = true;
        break;

      case "rejected":
        request.status = "rejected";
        break;


      default:
        return createResponse({ error: "Invalid action" }, 400);
    }

    await request.save();
    await category.save();

    return createResponse({ message: `Request ${action} successfully` }, 200);
  } catch (error) {
    console.error("Error processing request:", error);
    return createResponse({ error: "Internal server error", details: error.message }, 500);
  }
}
