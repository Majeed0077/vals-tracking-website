// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { TOKEN_NAME } from "@/lib/auth";
import { cookies } from "next/headers";
import { enforceRateLimit, enforceSameOrigin, getClientKey } from "@/lib/security";
import { verifyAuthToken } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const originError = enforceSameOrigin(req);
  if (originError) return originError;

  const rlError = enforceRateLimit(`auth-logout:${getClientKey(req)}`, 20, 60_000);
  if (rlError) return rlError;

  const res = NextResponse.json({ success: true });
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  const payload = token ? verifyAuthToken(token) : null;

  res.cookies.set(TOKEN_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  if (payload) {
    await logAudit({
      action: "auth.logout",
      actorId: payload.sub,
      actorEmail: payload.email,
      actorRole: payload.role,
      message: `Logout for ${payload.email}`,
    });
  }

  return res;
}
