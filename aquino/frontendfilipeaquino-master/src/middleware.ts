import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const allowedOrigins = [
  "https://www.filipeaquino.com.br",
  "https://filipeaquino.com.br",
  "https://landingpage-snzl.vercel.app",
];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Admin login redirect
  if (pathname === "/admin/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin-login";
    url.search = search;
    return NextResponse.redirect(url);
  }

  // CORS for API routes
  if (pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin") || "";
    const isAllowed = allowedOrigins.includes(origin);

    // Handle preflight OPTIONS
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": isAllowed ? origin : "",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const response = NextResponse.next();
    if (isAllowed) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/login", "/api/:path*"],
};
