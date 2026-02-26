import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AuditLog from "@/models/AuditLog";
import { requireAdmin } from "@/lib/routeAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    await connectDB();

    const limit = Math.min(200, Math.max(1, Number(req.nextUrl.searchParams.get("limit") || 50)));
    const action = req.nextUrl.searchParams.get("action");

    const filter: Record<string, unknown> = {};
    if (action) filter.action = action;

    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
    return NextResponse.json({ success: true, logs }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/audit-logs error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch audit logs",
      },
      { status: 500 }
    );
  }
}
