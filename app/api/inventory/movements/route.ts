import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import InventoryMovement from "@/models/InventoryMovement";
import { requireAdmin } from "@/lib/routeAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    await connectDB();

    const productId = req.nextUrl.searchParams.get("productId");
    const limit = Math.min(200, Math.max(1, Number(req.nextUrl.searchParams.get("limit") || 50)));

    const filter: Record<string, unknown> = {};
    if (productId && mongoose.isValidObjectId(productId)) {
      filter.productId = new mongoose.Types.ObjectId(productId);
    }

    const movements = await InventoryMovement.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, movements }, { status: 200 });
  } catch (error) {
    console.error("GET /api/inventory/movements error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch inventory movements",
      },
      { status: 500 }
    );
  }
}
