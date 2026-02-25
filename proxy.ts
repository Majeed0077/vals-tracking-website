// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { TOKEN_NAME } from "@/lib/auth";

const ADMIN_PATH_PREFIX = "/admin";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes (no auth needed)
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/admin/login" ||
    pathname.startsWith("/store")
  ) {
    return NextResponse.next();
  }

  // Read cookie (no JWT verify for now)
  const token = req.cookies.get(TOKEN_NAME)?.value;

  // Admin-only routes
  if (pathname.startsWith(ADMIN_PATH_PREFIX)) {
    if (!token) {
      // no token => send to /admin/login (which redirects to /login)
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    // token present => allow (we trust role for now)
    return NextResponse.next();
  }

  // default allow
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
