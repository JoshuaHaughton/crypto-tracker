import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware for initializing the application state in Next.js App Router.
 * It sets a 'initialRoute' cookie with the current pathname on initial page load.
 * This cookie is intended to be used in `src/app/layout.tsx` for server-side fetching
 * of initial data based on the route. The middleware runs for all routes.
 *
 * The 'initialRoute' cookie is expected to be managed (deleted or altered) by the client
 * to control when server-side data fetching should occur, as this middleware does not run
 * on client-side navigations.
 *
 * @param {NextRequest} request - The incoming request object from the client.
 * @returns {NextResponse} - The response with the 'initialRoute' cookie.
 */
export function middleware(request: NextRequest): NextResponse {
  const pathname = request.nextUrl.pathname;

  // Set the 'initialRoute' cookie with the current route
  const response = NextResponse.next();
  response.cookies.set("initialRoute", pathname);

  return response;
}

// Configuration to apply this middleware to all routes
export const config = {
  matcher: "/:path*",
};
