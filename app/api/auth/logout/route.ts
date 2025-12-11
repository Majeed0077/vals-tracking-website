// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { TOKEN_NAME } from "@/lib/auth";

export async function POST(_req: NextRequest) {
  const res = NextResponse.json({ success: true });

  res.cookies.set(TOKEN_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return res;
}
