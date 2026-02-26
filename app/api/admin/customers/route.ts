import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { requireAdmin } from "@/lib/routeAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    await connectDB();

    const q = String(req.nextUrl.searchParams.get("q") || "").trim();
    const segment = String(req.nextUrl.searchParams.get("segment") || "").trim();
    const limit = Math.min(200, Math.max(1, Number(req.nextUrl.searchParams.get("limit") || 50)));

    const filter: Record<string, unknown> = {};
    if (segment) filter.segment = segment;
    if (q) {
      filter.$or = [
        { email: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
      ];
    }

    const customers = await Customer.find(filter)
      .sort({ lastOrderAt: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, customers }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/customers error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch customers",
      },
      { status: 500 }
    );
  }
}
