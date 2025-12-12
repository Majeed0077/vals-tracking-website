// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { TOKEN_NAME, verifyAuthToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies(); // ✅ IMPORTANT
    const token = cookieStore.get(TOKEN_NAME)?.value;

    if (!token) {
      return NextResponse.json({ loggedIn: false, role: null }, { status: 200 });
    }

    const payload = verifyAuthToken(token);

    if (!payload) {
      return NextResponse.json({ loggedIn: false, role: null }, { status: 200 });
    }

    return NextResponse.json(
      {
        loggedIn: true,
        role: payload.role ?? null,
        email: payload.email ?? null,
        userId: payload.sub ?? null,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ loggedIn: false, role: null }, { status: 200 });
  }
}
