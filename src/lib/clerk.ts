import { createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher(["/", "/auth/v2/login", "/auth/v2/register"]);

// Define auth routes
const isAuthRoute = createRouteMatcher(["/auth/v2/login", "/auth/v2/register"]);

export { isPublicRoute, isAuthRoute };
