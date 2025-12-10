import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const ADMIN_SECRET = process.env.ADMIN_SECRET;
if (!ADMIN_SECRET) {
  throw new Error("Missing ADMIN_SECRET env variable");
}
const secretKey = new TextEncoder().encode(ADMIN_SECRET);

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // 1) Try to find admin first
    let role: "admin" | "user" | null = null;
    let passwordHash: string | null = null;

    const admin = await Admin.findOne({ email });
    if (admin) {
      role = "admin";
      passwordHash = admin.passwordHash;
    } else {
      // 2) If not admin, try normal user
      const user = await User.findOne({ email });
      if (user) {
        role = "user";
        passwordHash = user.passwordHash;
      }
    }

    if (!role || !passwordHash) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT with role
    const token = await new SignJWT({ email, role })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secretKey);

    const res = NextResponse.json({ success: true, role });

    // Set different cookies for admin vs user
    if (role === "admin") {
      res.cookies.set("admin_token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
    } else {
      res.cookies.set("user_token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
    }

    return res;
  } catch (err) {
    console.error("Auth login error:", err);
    return NextResponse.json(
      { success: false, message: "Server error during login" },
      { status: 500 }
    );
  }
}
