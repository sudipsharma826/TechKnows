import { NextResponse } from "next/server";
import { cookies } from "next/headers"; // To access cookies
import jwt from 'jsonwebtoken'; // You may need to install this package (`npm install jsonwebtoken`)

export const config = {
  matcher: [
    "/page/dashboard/:path*", // Apply middleware for dashboard and sub-paths
    "/page/dashboard",        // Apply middleware for the main dashboard
    "/auth/login",            // Handle redirection for logged-in users on login page
  ],
};
export async function middleware(req) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;
  const searchParams = url.searchParams;
  // Retrieve the accessToken from cookies (awaiting the cookies function)
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('acesstoken')?.value;
  console.log("Access token:", accessToken); // Debugging access token
  // Decode the access token if it exists
  let role = null;
  if (accessToken) {
    try {
      // Decode the JWT (make sure the token format is valid and contains the role)
      const decoded = jwt.decode(accessToken);
      role = decoded ? decoded.role : null; // Extract role from decoded token
      console.log("Decoded role:", role); // Debugging decoded role
    } catch (error) {
      // Handle the error if the token is invalid or cannot be decoded
      console.error("Token decoding failed:", error);
      role = null;
    }
  }
  // Define protected routes with allowed roles
  const protectedRoutes = [
    {
      path: "/page/dashboard", // General access for logged-in users
      roles: ["user", "admin", "superadmin"],
    },
    {
      path: "/page/dashboard/requests", // Specific access for `?tab=requests`
      roles: ["superadmin"],
      tab: "requests", // Additional check for query parameter
    },
    // Add other protected routes with specific roles here
  ];
  // Handle login page redirection for logged-in users
  if (pathname.startsWith("/auth/login") && role) {
    url.pathname = "/page/dashboard"; // Redirect logged-in users to dashboard
    return NextResponse.redirect(url);
  }
  // Check if the route is a protected route
  const matchingRoute = protectedRoutes.find((route) =>
    pathname.startsWith(route.path)
  );
  if (matchingRoute) {
    // Redirect unauthenticated users to login
    if (!role) {
      url.pathname = "/auth/login";
      url.searchParams.set("redirected", "true"); // Query param for toast
      return NextResponse.redirect(url);
    }
    // Check for roles and query parameters
    if (
      !matchingRoute.roles.includes(role) || // Role check
      (matchingRoute.tab && searchParams.get("tab") !== matchingRoute.tab) // Tab check
    ) {
      return NextResponse.json(
        { error: "You do not have access to this resource." },
        { status: 403 }
      );
    }
  }
  // Allow access for public routes (e.g., `/posts`, `/about`) as they're not matched by the matcher
  return NextResponse.next();
}