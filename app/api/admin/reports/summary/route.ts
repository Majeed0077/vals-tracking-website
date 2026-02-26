import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/routeAuth";
import Order from "@/models/Order";
import Customer from "@/models/Customer";

export const dynamic = "force-dynamic";

function parseDateParam(value: string | null, endOfDay = false): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  if (endOfDay) date.setHours(23, 59, 59, 999);
  else date.setHours(0, 0, 0, 0);
  return date;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    await connectDB();

    const from = parseDateParam(req.nextUrl.searchParams.get("from"));
    const to = parseDateParam(req.nextUrl.searchParams.get("to"), true);
    const rangeFilter: Record<string, unknown> = {};
    if (from || to) {
      rangeFilter.createdAt = {
        ...(from ? { $gte: from } : {}),
        ...(to ? { $lte: to } : {}),
      };
    }

    const orders = await Order.find(rangeFilter).lean();
    const customers = await Customer.find(rangeFilter).lean();

    const status = { pending: 0, shipped: 0, delivered: 0, cancelled: 0 };
    for (const order of orders) {
      if (order.status in status) {
        status[order.status as keyof typeof status] += 1;
      }
    }

    const nonCancelled = orders.filter((o) => o.status !== "cancelled");
    const revenue = nonCancelled.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const cogs = nonCancelled.reduce((sum, o) => sum + Number(o.cogsTotal || 0), 0);
    const refunds = orders.reduce((sum, o) => sum + Number(o.refundTotal || 0), 0);
    const netProfit = nonCancelled.reduce((sum, o) => sum + Number(o.netProfit || 0), 0);
    const aov = nonCancelled.length > 0 ? revenue / nonCancelled.length : 0;

    const topProductMap = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const order of nonCancelled) {
      for (const item of order.items ?? []) {
        const key = String(item.sku || item.name || "unknown");
        const current = topProductMap.get(key) || {
          name: String(item.name || key),
          qty: 0,
          revenue: 0,
        };
        current.qty += Number(item.qty || 0);
        current.revenue += Number(item.price || 0) * Number(item.qty || 0);
        topProductMap.set(key, current);
      }
    }

    const topProducts = Array.from(topProductMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return NextResponse.json(
      {
        success: true,
        summary: {
          range: { from, to },
          counts: {
            orders: orders.length,
            customers: customers.length,
          },
          finance: {
            revenue,
            cogs,
            refunds,
            netProfit,
            aov,
          },
          status,
          topProducts,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/reports/summary error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to build summary report",
      },
      { status: 500 }
    );
  }
}
