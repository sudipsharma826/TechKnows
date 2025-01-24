import connect from "../../../lib/mongodb/mongoose"; // Import the DB connection utility

// Helper function to handle database fetch with error handling
async function fetchUserAndAdminData(db, requestedBy) {
  try {
    let userName = "Unknown User";
    let adminData = null;

    if (requestedBy) {
      // Fetch user details
      const user = await db.collection("users").findOne({ _id: requestedBy });
      if (user) {
        userName = user.displayName || "Unknown User";
      }

      // Fetch dynamic admin data if applicable
      adminData = await db.collection(`admin_${requestedBy}`).findOne({ userId: requestedBy });
    }

    // Extract admin name and isActive status
    const adminName = adminData?.name || "Unknown Admin";
    const isActive = adminData?.isActive ?? false;

    return { userName, admin: { name: adminName, isActive } };
  } catch (error) {
    console.error("Error fetching user/admin data:", error);
    return { userName: "Unknown User", admin: { name: "Unknown Admin", isActive: false } };
  }
}

// Main GET handler
export async function GET(req) {
  try {
    const db = await connect(); // Connect to the database

    // Fetch all requests from the "requests" collection
    const requests = await db.collection("requests").find({}).toArray();

    // Enhance each request with user and admin details
    const enhancedRequests = await Promise.all(
      requests.map(async (request) => {
        const { userName, admin } = await fetchUserAndAdminData(db, request.requestedBy);
        
        return {
          ...request,
          userName, // Attach user name
          admin,    // Attach admin name and status
        };
      })
    );

    // Return the enhanced requests to the client
    return new Response(
      JSON.stringify({ requests: enhancedRequests }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching data:", error);

    // Return standardized error response
    return new Response(
      JSON.stringify({ error: "Request Fetch Failed" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
