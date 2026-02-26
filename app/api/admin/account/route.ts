import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { requireAdmin } from "@/lib/routeAuth";
import { enforceRateLimit, enforceSameOrigin, getClientKey } from "@/lib/security";

export const dynamic = "force-dynamic";

function toAccountPayload(doc: Record<string, unknown> | null) {
  if (!doc) return null;

  return {
    email: String(doc.email || ""),
    name: doc.name ? String(doc.name) : undefined,
    phone: doc.phone ? String(doc.phone) : undefined,
    avatarUrl: doc.avatarUrl ? String(doc.avatarUrl) : undefined,
    jobTitle: doc.jobTitle ? String(doc.jobTitle) : undefined,
    department: doc.department ? String(doc.department) : undefined,
    timezone: doc.timezone ? String(doc.timezone) : "Asia/Karachi",
    preferences:
      doc.preferences && typeof doc.preferences === "object"
        ? {
            emailAlerts: Boolean((doc.preferences as Record<string, unknown>).emailAlerts),
            orderAlerts: Boolean((doc.preferences as Record<string, unknown>).orderAlerts),
            lowStockAlerts: Boolean((doc.preferences as Record<string, unknown>).lowStockAlerts),
            reportDigest: Boolean((doc.preferences as Record<string, unknown>).reportDigest),
            language: String((doc.preferences as Record<string, unknown>).language || "en"),
          }
        : {
            emailAlerts: true,
            orderAlerts: true,
            lowStockAlerts: true,
            reportDigest: false,
            language: "en",
          },
    updatedAt: doc.updatedAt ? new Date(String(doc.updatedAt)).toISOString() : null,
  };
}

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    await connectDB();
    const admin = await Admin.collection.findOne(
      { _id: new mongoose.Types.ObjectId(auth.payload.sub) },
      {
        projection: {
          email: 1,
          name: 1,
          phone: 1,
          avatarUrl: 1,
          jobTitle: 1,
          department: 1,
          timezone: 1,
          preferences: 1,
          updatedAt: 1,
        },
      }
    );

    if (!admin) {
      return NextResponse.json({ success: false, message: "Admin account not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, account: toAccountPayload(admin) }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/account error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to fetch account" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const originError = enforceSameOrigin(req);
    if (originError) return originError;

    const rlError = enforceRateLimit(`admin-account-update:${getClientKey(req)}`, 35, 60_000);
    if (rlError) return rlError;

    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    await connectDB();
    const body = await req.json();

    const admin = await Admin.findById(auth.payload.sub);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Admin account not found" }, { status: 404 });
    }

    const updateType = String(body.updateType || "profile").trim();

    if (updateType === "password") {
      const currentPassword = String(body.currentPassword || "");
      const newPassword = String(body.newPassword || "");

      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { success: false, message: "Current and new password are required" },
          { status: 400 }
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { success: false, message: "New password must be at least 8 characters" },
          { status: 400 }
        );
      }

      const ok = await bcrypt.compare(currentPassword, String(admin.passwordHash || ""));
      if (!ok) {
        return NextResponse.json(
          { success: false, message: "Current password is incorrect" },
          { status: 400 }
        );
      }

      admin.passwordHash = await bcrypt.hash(newPassword, 10);
      await admin.save();
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const avatarDataUrl = body.avatarDataUrl ? String(body.avatarDataUrl).trim() : "";
    const $set: Record<string, unknown> = {
      timezone: body.timezone ? String(body.timezone).trim() : "Asia/Karachi",
      updatedAt: new Date(),
    };
    const $unset: Record<string, 1> = {};
    if (avatarDataUrl) {
      const isDataUrl = /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/i.test(avatarDataUrl);
      if (!isDataUrl) {
        return NextResponse.json(
          { success: false, message: "Invalid avatar image format. Use PNG/JPG/WEBP." },
          { status: 400 }
        );
      }

      const base64Part = avatarDataUrl.split(",")[1] || "";
      const approxBytes = Math.floor((base64Part.length * 3) / 4);
      if (approxBytes > 10 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: "Avatar image too large. Max size is 10MB." },
          { status: 400 }
        );
      }

      $set.avatarUrl = avatarDataUrl;
    } else if (body.removeAvatar === true) {
      $unset.avatarUrl = 1;
    }

    if (body.name) $set.name = String(body.name).trim();
    else $unset.name = 1;

    if (body.phone) $set.phone = String(body.phone).trim();
    else $unset.phone = 1;

    if (body.jobTitle) $set.jobTitle = String(body.jobTitle).trim();
    else $unset.jobTitle = 1;

    if (body.department) $set.department = String(body.department).trim();
    else $unset.department = 1;

    if (body.preferences && typeof body.preferences === "object") {
      $set.preferences = {
        emailAlerts: Boolean(body.preferences.emailAlerts),
        orderAlerts: Boolean(body.preferences.orderAlerts),
        lowStockAlerts: Boolean(body.preferences.lowStockAlerts),
        reportDigest: Boolean(body.preferences.reportDigest),
        language: String(body.preferences.language || "en"),
      };
    }

    await Admin.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(auth.payload.sub) },
      Object.keys($unset).length ? { $set, $unset } : { $set }
    );

    const updatedAccount = await Admin.collection.findOne(
      { _id: new mongoose.Types.ObjectId(auth.payload.sub) },
      {
        projection: {
          email: 1,
          name: 1,
          phone: 1,
          avatarUrl: 1,
          jobTitle: 1,
          department: 1,
          timezone: 1,
          preferences: 1,
          updatedAt: 1,
        },
      }
    );

    return NextResponse.json({ success: true, account: toAccountPayload(updatedAccount) }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/admin/account error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to update account" },
      { status: 500 }
    );
  }
}
