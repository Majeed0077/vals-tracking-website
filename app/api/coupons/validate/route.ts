import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import { enforceRateLimit, getClientKey } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rlError = enforceRateLimit(`coupon-validate:${getClientKey(req)}`, 60, 60_000);
    if (rlError) return rlError;

    const body = await req.json();
    const code = String(body.code ?? "").trim().toUpperCase();
    const subtotal = Math.max(0, Number(body.subtotal ?? 0) || 0);

    if (!code || subtotal <= 0) {
      return NextResponse.json(
        { success: false, message: "code and subtotal are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const coupon = await Coupon.findOne({ code, isActive: true }).lean();
    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Invalid coupon code" },
        { status: 404 }
      );
    }

    const now = new Date();
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return NextResponse.json(
        { success: false, message: "Coupon is not active yet" },
        { status: 400 }
      );
    }
    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      return NextResponse.json(
        { success: false, message: "Coupon has expired" },
        { status: 400 }
      );
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, message: "Coupon usage limit reached" },
        { status: 400 }
      );
    }
    if (subtotal < (coupon.minOrderTotal ?? 0)) {
      return NextResponse.json(
        {
          success: false,
          message: `Minimum order total is Rs ${coupon.minOrderTotal}`,
        },
        { status: 400 }
      );
    }

    let discount =
      coupon.type === "percentage"
        ? (subtotal * Number(coupon.value || 0)) / 100
        : Number(coupon.value || 0);

    if (coupon.maxDiscount != null) {
      discount = Math.min(discount, Number(coupon.maxDiscount || 0));
    }
    discount = Math.max(0, discount);

    return NextResponse.json(
      {
        success: true,
        coupon: {
          id: coupon._id,
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
        },
        subtotal,
        discount,
        finalTotal: Math.max(0, subtotal - discount),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/coupons/validate error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to validate coupon",
      },
      { status: 500 }
    );
  }
}
