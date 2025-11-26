// Middleware for Route Protection
// Handles authentication and authorization at the route level

import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Define protected routes
  const protectedRoutes = [
    "/",
    "/main",
    "/admin",
    "/profile",
    "/maps",
    "/data",
    "/reports",
  ];

  // Define public routes (always accessible)
  const publicRoutes = [
    "/auth/signin",
    "/auth/signup",
    "/api/auth",
  ];

  // Check if current path is protected
  // Special handling for root path "/"
  const isProtectedRoute = pathname === "/" || protectedRoutes.some(route =>
    route !== "/" && pathname.startsWith(route)
  );

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Allow API routes and static files to pass through
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // If it's a protected route, check for authentication
  if (isProtectedRoute) {
    // Check for Lark session cookie
    const sessionCookie = request.cookies.get("lark-session")?.value;

    // Redirect to sign in if no session cookie
    if (!sessionCookie) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Session exists, allow access
    return NextResponse.next();
  }

  // If user is authenticated and trying to access auth pages, redirect to home
  if (isPublicRoute && pathname.startsWith("/auth/")) {
    const sessionCookie = request.cookies.get("lark-session")?.value;

    if (sessionCookie) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
};
