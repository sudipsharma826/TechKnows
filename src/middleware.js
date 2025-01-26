import { NextResponse } from "next/server";
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
  const { pathname, search } = url;

  // Retrieve cookies from the request
  const accessToken = req.cookies.get("acessToken")?.value;

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

  // Define unrestricted paths and public tabs
  const publicTabs = ["mypayment"]; 
  const restrictedPaths = {
    user: [
      "requests",
      "createpost",
      "requestcategory",
      "categories",
      "addcategory",
      "packages",
      "addcategories",
      "addpackages",
      "getpost",
    ],
    admin: ["categories", "requests", "packages", "addcategory"],
    superadmin: [], 
  };

  // Handle unauthenticated users
  if (!accessToken) {
    if (pathname !== "/auth/login") {
      url.pathname = "/auth/login";
      url.searchParams.set("redirected", "true");
      return NextResponse.redirect(url);
    }
    return NextResponse.next(); 
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
    return NextResponse.next(); // Allow access to login page
  }

  // Extract `tab` parameter from the query string
  const tab = new URLSearchParams(search).get("tab");

  // Allow access to public tabs for all authenticated users
  if (publicTabs.includes(tab)) {
    return NextResponse.next();
  }

  // Check if the path is restricted for the user's role
  if (role && tab && restrictedPaths[role]?.includes(tab)) {
    return NextResponse.json(
      { error: "You do not have access to this resource." },
      { status: 403 }
    );
  }

  // Redirect logged-in users away from the login page
  if (pathname.startsWith("/auth/login") && role) {
    url.pathname = "/page/dashboard";
    return NextResponse.redirect(url);
  }

  // Allow access to all other routes
  return NextResponse.next();
}
