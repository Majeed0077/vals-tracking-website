import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { TOKEN_NAME, verifyAuthToken } from "@/lib/auth";
import { enforceRateLimit, enforceSameOrigin, getClientKey } from "@/lib/security";

export const dynamic = "force-dynamic";

async function getAuthedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;

  const payload = verifyAuthToken(token);
  if (!payload || payload.role !== "user") return null;

  await connectDB();
  return User.findById(payload.sub);
}

export async function GET() {
  try {
    const user = await getAuthedUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    return NextResponse.json(
      {
        success: true,
        profile: {
          _id: user._id,
          email: user.email,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          dateOfBirth: user.dateOfBirth,
          addresses: user.addresses || [],
          preferences: user.preferences || {},
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/account/profile error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const originError = enforceSameOrigin(req);
    if (originError) return originError;

    const rlError = enforceRateLimit(`account-profile-update:${getClientKey(req)}`, 30, 60_000);
    if (rlError) return rlError;

    const user = await getAuthedUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const updateType = String(body.updateType || "profile").trim();

    if (updateType === "password") {
      const currentPassword = String(body.currentPassword || "");
      const newPassword = String(body.newPassword || "");
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { success: false, message: "Current password and new password are required" },
          { status: 400 }
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { success: false, message: "New password must be at least 8 characters" },
          { status: 400 }
        );
      }

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, message: "Current password is incorrect" },
          { status: 400 }
        );
      }

      user.passwordHash = await bcrypt.hash(newPassword, 10);
      await user.save();
      return NextResponse.json({ success: true }, { status: 200 });
    }

    user.firstName = body.firstName ? String(body.firstName).trim() : undefined;
    user.lastName = body.lastName ? String(body.lastName).trim() : undefined;
    user.name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.name;
    user.phone = body.phone ? String(body.phone).trim() : undefined;
    const avatarDataUrl = body.avatarDataUrl ? String(body.avatarDataUrl).trim() : "";
    if (avatarDataUrl) {
      const isDataUrl = /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/i.test(avatarDataUrl);
      if (!isDataUrl) {
        return NextResponse.json(
          { success: false, message: "Invalid avatar image format. Use PNG/JPG/WEBP." },
          { status: 400 }
        );
      }

      // Rough 10MB binary cap for DB payload safety.
      const base64Part = avatarDataUrl.split(",")[1] || "";
      const approxBytes = Math.floor((base64Part.length * 3) / 4);
      if (approxBytes > 10 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: "Avatar image too large. Max size is 10MB." },
          { status: 400 }
        );
      }

      user.avatarUrl = avatarDataUrl;
    } else if (body.removeAvatar === true) {
      user.avatarUrl = undefined;
    }
    user.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : undefined;

    if (body.preferences && typeof body.preferences === "object") {
      user.preferences = {
        newsletter: Boolean(body.preferences.newsletter),
        emailOffers: Boolean(body.preferences.emailOffers),
        smsAlerts: Boolean(body.preferences.smsAlerts),
        whatsappAlerts: Boolean(body.preferences.whatsappAlerts),
        language: String(body.preferences.language || "en"),
        currency: String(body.preferences.currency || "PKR"),
      };
    }

    if (Array.isArray(body.addresses)) {
      user.addresses = body.addresses.slice(0, 3).map((addr: Record<string, unknown>) => ({
        label: addr.label ? String(addr.label).trim() : undefined,
        fullName: addr.fullName ? String(addr.fullName).trim() : undefined,
        phone: addr.phone ? String(addr.phone).trim() : undefined,
        line1: addr.line1 ? String(addr.line1).trim() : undefined,
        line2: addr.line2 ? String(addr.line2).trim() : undefined,
        city: addr.city ? String(addr.city).trim() : undefined,
        state: addr.state ? String(addr.state).trim() : undefined,
        postalCode: addr.postalCode ? String(addr.postalCode).trim() : undefined,
        country: addr.country ? String(addr.country).trim() : "Pakistan",
        isDefaultShipping: Boolean(addr.isDefaultShipping),
        isDefaultBilling: Boolean(addr.isDefaultBilling),
      }));
    }

    await user.save();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/account/profile error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to update profile" },
      { status: 500 }
    );
  }
}
