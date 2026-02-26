import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import { requireAdmin } from "@/lib/routeAuth";
import { enforceRateLimit, enforceSameOrigin, getClientKey } from "@/lib/security";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    await connectDB();
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, coupons }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/coupons error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch coupons",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const originError = enforceSameOrigin(req);
    if (originError) return originError;

    const rlError = enforceRateLimit(`coupon-create:${getClientKey(req)}`, 25, 60_000);
    if (rlError) return rlError;

    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    await connectDB();
    const body = await req.json();

    const code = String(body.code ?? "").trim().toUpperCase();
    const type = String(body.type ?? "").trim();
    const value = Number(body.value);

    if (!code || !["percentage", "fixed"].includes(type) || Number.isNaN(value) || value <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid coupon payload" },
        { status: 400 }
      );
    }

    const existing = await Coupon.findOne({ code }).lean();
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Coupon code already exists" },
        { status: 409 }
      );
    }

    const coupon = await Coupon.create({
      code,
      type,
      value,
      minOrderTotal: Math.max(0, Number(body.minOrderTotal ?? 0) || 0),
      maxDiscount:
        body.maxDiscount === undefined ? undefined : Math.max(0, Number(body.maxDiscount) || 0),
      usageLimit:
        body.usageLimit === undefined ? undefined : Math.max(0, Number(body.usageLimit) || 0),
      validFrom: body.validFrom ? new Date(body.validFrom) : undefined,
      validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
      isActive: body.isActive !== false,
      appliesToCategories: Array.isArray(body.appliesToCategories)
        ? body.appliesToCategories.map((x: unknown) => String(x))
        : [],
      notes: body.notes ? String(body.notes) : undefined,
    });

    await logAudit({
      action: "coupon.create",
      actorId: auth.payload.sub,
      actorEmail: auth.payload.email,
      actorRole: auth.payload.role,
      entityType: "Coupon",
      entityId: coupon._id.toString(),
      message: `Created coupon ${coupon.code}`,
    });

    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/coupons error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create coupon",
      },
      { status: 500 }
    );
  }
}
