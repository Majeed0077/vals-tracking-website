import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import PaymentTransaction from "@/models/PaymentTransaction";
import { requireAdmin } from "@/lib/routeAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    await connectDB();

    const provider = String(req.nextUrl.searchParams.get("provider") || "").trim();
    const status = String(req.nextUrl.searchParams.get("status") || "").trim();
    const orderId = String(req.nextUrl.searchParams.get("orderId") || "").trim();
    const limit = Math.min(200, Math.max(1, Number(req.nextUrl.searchParams.get("limit") || 50)));

    const filter: Record<string, unknown> = {};
    if (provider) filter.provider = provider;
    if (status) filter.status = status;
    if (orderId) {
      if (!mongoose.isValidObjectId(orderId)) {
        return NextResponse.json(
          { success: false, message: "Invalid orderId" },
          { status: 400 }
        );
      }
      filter.orderId = orderId;
    }

    const transactions = await PaymentTransaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({
        path: "orderId",
        select: "total paymentStatus status customer.email customer.name",
      })
      .lean();

    return NextResponse.json({ success: true, transactions }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/payments error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch payments",
      },
      { status: 500 }
    );
  }
}
