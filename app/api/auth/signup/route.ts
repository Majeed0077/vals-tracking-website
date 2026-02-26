// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signAuthToken, TOKEN_NAME, TOKEN_MAX_AGE } from "@/lib/auth";
import { enforceRateLimit, enforceSameOrigin, getClientKey } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const originError = enforceSameOrigin(req);
    if (originError) return originError;

    const rlError = enforceRateLimit(`auth-signup:${getClientKey(req)}`, 8, 60_000);
    if (rlError) return rlError;

    await connectDB();

    const { name, email, password } = await req.json();

    const cleanName = String(name ?? "").trim();
    const cleanEmail = String(email ?? "").trim().toLowerCase();
    const cleanPassword = String(password ?? "");

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    if (cleanPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Prevent duplicate account
    const existing = await User.findOne({ email: cleanEmail }).lean();
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 409 }
      );
    }

    // ✅ IMPORTANT: schema expects passwordHash
    const passwordHash = await bcrypt.hash(cleanPassword, 10);

    const user = await User.create({
      email: cleanEmail,
      passwordHash, // ✅ matches schema :contentReference[oaicite:2]{index=2}
      name: cleanName || undefined,
    });

    // Auto-login after signup (same pattern as login) :contentReference[oaicite:3]{index=3}
    const token = signAuthToken({
      sub: user._id.toString(),
      email: user.email,
      role: "user",
    });

    const res = NextResponse.json(
      { success: true, role: "user" },
      { status: 200 }
    );

    res.cookies.set(TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: TOKEN_MAX_AGE,
    });

    return res;
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { success: false, message: "Server error during signup" },
      { status: 500 }
    );
  }
}
