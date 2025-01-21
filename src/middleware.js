import { NextResponse } from "next/server";
import { cookies } from "next/headers"; 
import jwt from 'jsonwebtoken'; 
import { toast } from 'sonner';

export const config = {
  matcher: [
    "/page/dashboard/:path*", 
    "/page/dashboard",       
    "/auth/login",          
  ],
};

export async function middleware(req) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;
  const searchParams = url.searchParams;
  // Retrieve the accessToken from cookies
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('acesstoken')?.value;

  console.log("Access token:", accessToken); 

  let role = null;
  let isActive = null;

  if (accessToken) {
    try {
      // Decode the JWT (make sure the token format is valid and contains the role and isActive)
      const decoded = jwt.decode(accessToken);
      role = decoded ? decoded.role : null; // Extract role from decoded token
      isActive = decoded ? decoded.isActive : null; // Extract isActive from decoded token
      console.log("Decoded role:", role); // Debugging decoded role
      console.log("Decoded isActive:", isActive); // Debugging decoded isActive
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

  // Handle inactive users with a toast message and redirection to login
  if (pathname.startsWith("/auth/login") && isActive === false) {
    // Redirect user to login with a query param to trigger the toast
    url.pathname = "/auth/login";
    url.searchParams.set("toastMessage", "Your account is not verified. Please verify your email and login again.");
    
    // Trigger a toast notification
    toast.error("Your account is not verified. Please verify your email and login again.");
    
    return NextResponse.redirect(url);
  }

  // Check if the route is a protected route
  const matchingRoute = protectedRoutes.find((route) =>
    pathname.startsWith(route.path)
  );
  
  if (matchingRoute) {
    // If user is not authenticated, redirect to login
    if (!role) {
      url.pathname = "/auth/login";
      url.searchParams.set("redirected", "true"); // Query param for toast message
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
