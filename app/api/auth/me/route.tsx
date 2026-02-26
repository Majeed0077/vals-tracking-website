// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { TOKEN_MAX_AGE, TOKEN_NAME, signAuthToken, verifyAuthToken } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Admin from "@/models/Admin";

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

    await connectDB();
    let name: string | null = null;
    let firstName: string | null = null;
    let lastName: string | null = null;
    let avatarUrl: string | null = null;

    if (payload.role === "admin") {
      const admin = await Admin.findById(payload.sub).select("name").lean<{ name?: string }>();
      name = admin?.name ?? null;
    } else {
      const user = await User.findById(payload.sub)
        .select("name firstName lastName avatarUrl")
        .lean<{ name?: string; firstName?: string; lastName?: string; avatarUrl?: string }>();
      name = user?.name ?? null;
      firstName = user?.firstName ?? null;
      lastName = user?.lastName ?? null;
      avatarUrl = user?.avatarUrl ?? null;
    }

    const response = NextResponse.json(
      {
        loggedIn: true,
        role: payload.role ?? null,
        email: payload.email ?? null,
        userId: payload.sub ?? null,
        user: {
          name,
          firstName,
          lastName,
          avatarUrl,
        },
      },
      { status: 200 }
    );

    // Sliding session: each valid visit extends login by another TOKEN_MAX_AGE window.
    const renewedToken = signAuthToken({
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    });
    response.cookies.set(TOKEN_NAME, renewedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: TOKEN_MAX_AGE,
    });

    return response;
  } catch {
    return NextResponse.json({ loggedIn: false, role: null }, { status: 200 });
  }
}
