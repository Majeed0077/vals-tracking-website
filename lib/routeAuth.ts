import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { TOKEN_NAME, type AuthTokenPayload, verifyAuthToken } from "@/lib/auth";

type AdminAuthResult =
  | { ok: true; payload: AuthTokenPayload }
  | { ok: false; response: NextResponse };

export async function requireAdmin(): Promise<AdminAuthResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  const payload = verifyAuthToken(token);

  if (!payload || payload.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      ),
    };
  }

  return { ok: true, payload };
}
