import connect from "../../../lib/mongodb/mongoose"; // Import the DB connection utility

export async function GET(req) {
  try {
    const db = await connect(); // Connect to the database

    // Query the "requests" collection to get the requests data
    const requests = await db.collection("requests").find({}).toArray();

    // Fetch user details for each request using their `requestedBy` field
    const enhancedRequests = await Promise.all(
      requests.map(async (request) => {
        let userName = "Unknown User"; // Default user name
        let adminData = null;

        if (request.requestedBy) {
          // Fetch user details from the "users" collection
          const user = await db
            .collection("users")
            .findOne({ _id: request.requestedBy });

          console.log(`admin_${request.requestedBy}`);

          // Fetch admin data dynamically (if applicable)
          adminData = await db
            .collection(`admin_${request.requestedBy}`)
            .findOne({ userId: request.requestedBy });

          userName = user?.displayName || "Unknown User";
        }

        console.log("adminData", adminData);

        // Extract admin name and isActive from admin data if available
        const adminName = adminData?.name || "Unknown Admin"; // Assuming the admin's name is stored in the "name" field
        const isActive = adminData?.isActive ?? false; // Default to false if not available

        return {
          ...request,
          userName, // Attach user name
          admin: { name: adminName, isActive }, // Attach admin name and isActive status
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

    // Return error response
    return new Response(
      JSON.stringify({ error: "Request Fetch Failed" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
