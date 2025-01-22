import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { toast } from "sonner";

export const config = {
  matcher: [
    "/page/dashboard/:path*", // Matches all dashboard subpaths
    "/page/dashboard",        // Matches dashboard root
    "/auth/login",            // Matches login page
  ],
};

export async function middleware(req) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;
  const searchParams = url.searchParams;

  // Retrieve the accessToken from cookies
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("acesstoken")?.value;

  console.log("Access token:", accessToken); // Debugging token

  let role = null;
  let isActive = null;

  if (accessToken) {
    try {
      // Decode the JWT and extract role and isActive
      const decoded = jwt.decode(accessToken);
      role = decoded?.role || null;
      isActive = decoded?.isActive || null;

      console.log("Decoded role:", role);
      console.log("Decoded isActive:", isActive);
    } catch (error) {
      console.error("Token decoding failed:", error);
    }
  }

  // Define protected routes with allowed roles
  const protectedRoutes = [
    {
      path: "/page/dashboard",
      roles: ["user", "admin", "superadmin"], // General access for all roles
    },
    {
      path: "/page/dashboard/requests",
      roles: ["superadmin"], // Specific access for superadmins
      tab: "requests",       // Additional query param check
    },
  ];

  // Handle login page redirection for logged-in users
  if (pathname.startsWith("/auth/login") && role) {
    url.pathname = "/page/dashboard"; // Redirect logged-in users to dashboard
    return NextResponse.redirect(url);
  }

  // If accessToken is missing, redirect to login
  if (!accessToken && pathname !== "/auth/login") {
    url.pathname = "/auth/login";
    url.searchParams.set("redirected", "true");
    return NextResponse.redirect(url);
  }

  // Handle inactive users with a toast message and redirection
  if (isActive === false) {
    if (pathname !== "/auth/login") {
      url.pathname = "/auth/login"; // Redirect to login if not already there
      url.searchParams.set("toastMessage", "Your account is not verified. Please verify your email and login again.");
      toast.info("Your account is not verified. Please verify your email and login again.");
      return NextResponse.redirect(url);
    }
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

    // Check for roles and optional tab parameter
    if (
      !matchingRoute.roles.includes(role) ||
      (matchingRoute.tab && searchParams.get("tab") !== matchingRoute.tab)
    ) {
      return NextResponse.json(
        { error: "You do not have access to this resource." },
        { status: 403 }
      );
    }
  }

  // Allow access to non-protected routes
  return NextResponse.next();
}
