import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await connectDB();

    const email = "admin@vals.com";
    const plainPassword = "admin123"; // is password se login karoge

    const passwordHash = await bcrypt.hash(plainPassword, 10);

    await Admin.updateOne(
      { email },
      {
        $set: {
          email,
          passwordHash,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Admin seeded/updated successfully",
      loginEmail: email,
      loginPassword: plainPassword,
    });
  } catch (err) {
    console.error("SEED PROD ADMIN ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Error seeding admin" },
      { status: 500 }
    );
  }
}
