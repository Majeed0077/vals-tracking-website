// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { TOKEN_NAME, verifyAuthToken } from "@/lib/auth";

const ADMIN_PATH_PREFIX = "/admin";

function applySecurityHeaders(res: NextResponse, requestId: string): NextResponse {
  res.headers.set("x-request-id", requestId);
  res.headers.set("x-content-type-options", "nosniff");
  res.headers.set("x-frame-options", "DENY");
  res.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  res.headers.set("permissions-policy", "geolocation=(), microphone=(), camera=()");
  return res;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const requestId = crypto.randomUUID();

  // Public routes (no auth needed)
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/admin/login" ||
    pathname.startsWith("/api/ops/health") ||
    pathname.startsWith("/store")
  ) {
    return applySecurityHeaders(NextResponse.next(), requestId);
  }

  // Read cookie + verify JWT
  const token = req.cookies.get(TOKEN_NAME)?.value;
  const payload = token ? verifyAuthToken(token) : null;

  // Admin-only routes
  if (pathname.startsWith(ADMIN_PATH_PREFIX)) {
    if (!token || !payload || payload.role !== "admin") {
      // no token => send to /admin/login (which redirects to /login)
      return applySecurityHeaders(
        NextResponse.redirect(new URL("/admin/login", req.url)),
        requestId
      );
    }
    return applySecurityHeaders(NextResponse.next(), requestId);
  }

  // default allow
  return applySecurityHeaders(NextResponse.next(), requestId);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
