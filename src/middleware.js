import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const config = {
  matcher: [
    "/page/dashboard/:path*", // Matches all dashboard subpaths
    "/page/dashboard",        // Matches dashboard root
    "/auth/login",            // Matches login page
  ],
};

export async function middleware(req) {
  const url = req.nextUrl.clone();
  const { pathname, searchParams } = url;

  // Retrieve the accessToken from cookies
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("acesstoken")?.value;

  let role = null;
  let isActive = null;

  // Decode the JWT if accessToken exists
  if (accessToken) {
    try {
      const decoded = jwt.decode(accessToken);
      role = decoded?.role || null;
      isActive = decoded?.isActive || null;
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  // Define protected routes with roles
  const protectedRoutes = [
    {
      path: "/page/dashboard",
      roles: ["user", "admin", "superadmin"], // Accessible to all roles
    },
    {
      path: "/page/dashboard/requests",
      roles: ["superadmin"], // Only superadmins can access
      tab: "requests",       // Additional query parameter check
    },
  ];

  // Redirect logged-in users away from the login page
  if (pathname.startsWith("/auth/login") && role) {
    url.pathname = "/page/dashboard"; // Redirect to dashboard
    return NextResponse.redirect(url);
  }

  // Redirect unauthenticated users to login page
  if (!accessToken && pathname !== "/auth/login") {
    url.pathname = "/auth/login";
    url.searchParams.set("redirected", "true");
    return NextResponse.redirect(url);
  }

  // Handle inactive accounts
  if (isActive === false) {
    if (pathname !== "/auth/login") {
      url.pathname = "/auth/login";
      url.searchParams.set("toastMessage", "Your account is not verified. Please verify your email and login again.");
      return NextResponse.redirect(url);
    }
  }

  // Match the current route to a protected route
  const matchingRoute = protectedRoutes.find((route) =>
    pathname.startsWith(route.path)
  );

  if (matchingRoute) {
    // Redirect to login if user is not authenticated
    if (!role) {
      url.pathname = "/auth/login";
      url.searchParams.set("redirected", "true");
      return NextResponse.redirect(url);
    }

    // Check if user has the required role or tab
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
