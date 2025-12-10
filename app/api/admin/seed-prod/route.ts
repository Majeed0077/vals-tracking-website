// app/api/admin/seed-prod/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";

// Force Node.js runtime (Edge pe mongoose hang ho sakta hai)
export const runtime = "nodejs";

export async function GET() {
  try {
    console.log("SEED PROD: start");
    await connectDB();
    console.log("SEED PROD: DB connected");

    const email = "admin@vals.com";
    const plainPassword = "admin123"; // is se login karoge

    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const result = await Admin.updateOne(
      { email },
      {
        $set: {
          email,
          passwordHash,
        },
      },
      { upsert: true }
    );

    console.log("SEED PROD: update result", JSON.stringify(result));

    return NextResponse.json({
      success: true,
      message: "Admin seeded/updated successfully",
      loginEmail: email,
      loginPassword: plainPassword,
    });
  } catch (err: any) {
    console.error("SEED PROD ERROR:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Error seeding admin",
        error: err?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
