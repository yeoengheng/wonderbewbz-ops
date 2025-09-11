import { NextResponse } from "next/server";

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher(["/auth/v2/login", "/auth/v2/register"]);

// Define auth routes
const isAuthRoute = createRouteMatcher(["/auth/v2/login", "/auth/v2/register"]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (userId && isAuthRoute(request)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user is not authenticated and trying to access protected routes, redirect to login
  if (!userId && !isPublicRoute(request)) {
    return NextResponse.redirect(new URL("/auth/v2/login", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
