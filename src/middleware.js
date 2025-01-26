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
  const { pathname } = url;

  // Retrieve the accessToken synchronously
  const cookieStore = cookies();
  const accessToken = cookieStore?.get("acessToken")?.value;

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

  // Define restricted routes for each role
  const restrictedPaths = {
    user: [
      "/page/dashboard?tab=requests",
      "/page/dashboard?tab=createpost",
      "/page/dashboard?tab=requestcategory",
    ],
    admin: [
      "/page/dashboard?tab=categories",
      "/page/dashboard?tab=requests",
    ],
    superadmin: [], // No restricted paths for superadmin
  };

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
      url.searchParams.set(
        "toastMessage",
        "Your account is not verified. Please verify your email and login again."
      );
      return NextResponse.redirect(url);
    }
  }

  // Check if the path is restricted for the user's role
  const queryParams = pathname.includes("?") ? pathname.split("?")[1] : "";
  const cleanPath = pathname.split("?")[0];
  const fullPath = `${cleanPath}?${queryParams}`;

  if (role && restrictedPaths[role]?.includes(fullPath)) {
    return NextResponse.json(
      { error: "You do not have access to this resource." },
      { status: 403 }
    );
  }

  // Allow access to non-restricted routes
  return NextResponse.next();
}
