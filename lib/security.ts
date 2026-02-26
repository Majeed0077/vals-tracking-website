import { NextRequest, NextResponse } from "next/server";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

declare global {
  var __rateLimitStore: Map<string, RateLimitEntry> | undefined;
}

const store = globalThis.__rateLimitStore ?? new Map<string, RateLimitEntry>();
globalThis.__rateLimitStore = store;

export function getClientKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0]?.trim() || "unknown";
  const ua = req.headers.get("user-agent") || "unknown";
  return `${ip}:${ua.slice(0, 80)}`;
}

export function enforceSameOrigin(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");

  if (!origin || !host) return null;

  const expected = req.nextUrl.origin;
  if (origin !== expected) {
    return NextResponse.json(
      { success: false, message: "Cross-site request blocked" },
      { status: 403 }
    );
  }

  return null;
}

export function enforceRateLimit(
  key: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (current.count >= limit) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Try again shortly." },
      { status: 429 }
    );
  }

  current.count += 1;
  store.set(key, current);
  return null;
}
