import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import { requireAdmin } from "@/lib/routeAuth";
import { enforceRateLimit, enforceSameOrigin, getClientKey } from "@/lib/security";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const originError = enforceSameOrigin(req);
    if (originError) return originError;

    const rlError = enforceRateLimit(`coupon-update:${getClientKey(req)}`, 40, 60_000);
    if (rlError) return rlError;

    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: "Invalid coupon id" }, { status: 400 });
    }

    await connectDB();
    const body = await req.json();

    const update: Record<string, unknown> = {};
    if (body.code !== undefined) update.code = String(body.code).trim().toUpperCase();
    if (body.type !== undefined) update.type = String(body.type);
    if (body.value !== undefined) update.value = Math.max(0, Number(body.value) || 0);
    if (body.minOrderTotal !== undefined) update.minOrderTotal = Math.max(0, Number(body.minOrderTotal) || 0);
    if (body.maxDiscount !== undefined) update.maxDiscount = Math.max(0, Number(body.maxDiscount) || 0);
    if (body.usageLimit !== undefined) update.usageLimit = Math.max(0, Number(body.usageLimit) || 0);
    if (body.isActive !== undefined) update.isActive = Boolean(body.isActive);
    if (body.validFrom !== undefined) update.validFrom = body.validFrom ? new Date(body.validFrom) : undefined;
    if (body.validUntil !== undefined) update.validUntil = body.validUntil ? new Date(body.validUntil) : undefined;
    if (body.notes !== undefined) update.notes = String(body.notes || "").trim() || undefined;
    if (body.appliesToCategories !== undefined && Array.isArray(body.appliesToCategories)) {
      update.appliesToCategories = body.appliesToCategories.map((x: unknown) => String(x));
    }

    const coupon = await Coupon.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!coupon) {
      return NextResponse.json({ success: false, message: "Coupon not found" }, { status: 404 });
    }

    await logAudit({
      action: "coupon.update",
      actorId: auth.payload.sub,
      actorEmail: auth.payload.email,
      actorRole: auth.payload.role,
      entityType: "Coupon",
      entityId: id,
      message: `Updated coupon ${coupon.code}`,
    });

    return NextResponse.json({ success: true, coupon }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/admin/coupons/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update coupon",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const originError = enforceSameOrigin(req);
    if (originError) return originError;

    const rlError = enforceRateLimit(`coupon-delete:${getClientKey(req)}`, 25, 60_000);
    if (rlError) return rlError;

    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: "Invalid coupon id" }, { status: 400 });
    }

    await connectDB();
    const coupon = await Coupon.findByIdAndDelete(id).lean();
    if (!coupon) {
      return NextResponse.json({ success: false, message: "Coupon not found" }, { status: 404 });
    }

    await logAudit({
      action: "coupon.delete",
      actorId: auth.payload.sub,
      actorEmail: auth.payload.email,
      actorRole: auth.payload.role,
      entityType: "Coupon",
      entityId: id,
      message: `Deleted coupon ${coupon.code}`,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/admin/coupons/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete coupon",
      },
      { status: 500 }
    );
  }
}
