// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import User from "@/models/User";
import { signAuthToken, TOKEN_NAME, TOKEN_MAX_AGE } from "@/lib/auth";
import { enforceRateLimit, enforceSameOrigin, getClientKey } from "@/lib/security";

type AccountDoc = {
  _id: { toString(): string };
  email: string;
  passwordHash: string;
};

export async function POST(req: NextRequest) {
  try {
    const originError = enforceSameOrigin(req);
    if (originError) return originError;

    const rlError = enforceRateLimit(`auth-login:${getClientKey(req)}`, 15, 60_000);
    if (rlError) return rlError;

    await connectDB();

    const { email, password } = (await req.json()) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // 1) Try admin first
    let role: "admin" | "user" | null = null;

    let account: AccountDoc | null = await Admin.findOne({ email })
      .select("_id email passwordHash")
      .lean<AccountDoc>();

    if (account) {
      role = "admin";
    } else {
      // 2) Try user
      account = await User.findOne({ email })
        .select("_id email passwordHash")
        .lean<AccountDoc>();

      if (account) role = "user";
    }

    if (!account || !role) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, account.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 3) Create JWT (id + email + role)
    const token = signAuthToken({
      sub: account._id.toString(),
      email: account.email,
      role,
    });

    if (role === "admin") {
      await Admin.findByIdAndUpdate(account._id, { lastLoginAt: new Date() });
    }

    const res = NextResponse.json({ success: true, role }, { status: 200 });

    // 4) Single HTTP-only cookie for both roles
    res.cookies.set(TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: TOKEN_MAX_AGE,
    });

    return res;
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error during login" },
      { status: 500 }
    );
  }
}
