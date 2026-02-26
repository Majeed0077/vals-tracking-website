import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/routeAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    await connectDB();

    const products = await Product.find({
      $expr: { $lte: ["$stock", "$lowStockThreshold"] },
    })
      .select("_id name sku stock lowStockThreshold category")
      .sort({ stock: 1 })
      .lean();

    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error) {
    console.error("GET /api/products/low-stock error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch low stock products",
      },
      { status: 500 }
    );
  }
}
