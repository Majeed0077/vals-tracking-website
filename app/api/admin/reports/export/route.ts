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

function csvEscape(input: unknown): string {
  const str = String(input ?? "");
  if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
    return `"${str.replace(/"/g, "\"\"")}"`;
  }
  return str;
}

function toCsv(headers: string[], rows: Array<Array<unknown>>): string {
  const lines: string[] = [];
  lines.push(headers.map(csvEscape).join(","));
  for (const row of rows) {
    lines.push(row.map(csvEscape).join(","));
  }
  return lines.join("\n");
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    await connectDB();

    const entity = String(req.nextUrl.searchParams.get("entity") || "orders");
    const from = parseDateParam(req.nextUrl.searchParams.get("from"));
    const to = parseDateParam(req.nextUrl.searchParams.get("to"), true);

    const filter: Record<string, unknown> = {};
    if (from || to) {
      filter.createdAt = {
        ...(from ? { $gte: from } : {}),
        ...(to ? { $lte: to } : {}),
      };
    }

    if (entity === "customers") {
      const customers = await Customer.find(filter).sort({ createdAt: -1 }).lean();
      const csv = toCsv(
        [
          "id",
          "email",
          "name",
          "phone",
          "segment",
          "orderCount",
          "totalSpent",
          "averageOrderValue",
          "ltv",
          "lastOrderAt",
          "createdAt",
        ],
        customers.map((c) => [
          c._id,
          c.email,
          c.name,
          c.phone,
          c.segment,
          c.orderCount,
          c.totalSpent,
          c.averageOrderValue,
          c.ltv,
          c.lastOrderAt ? new Date(c.lastOrderAt).toISOString() : "",
          c.createdAt ? new Date(c.createdAt).toISOString() : "",
        ])
      );

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=customers-report.csv",
        },
      });
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    const csv = toCsv(
      [
        "id",
        "status",
        "paymentStatus",
        "customerEmail",
        "customerName",
        "subtotal",
        "taxTotal",
        "discountTotal",
        "shippingCost",
        "refundTotal",
        "total",
        "cogsTotal",
        "netProfit",
        "createdAt",
      ],
      orders.map((o) => [
        o._id,
        o.status,
        o.paymentStatus,
        o.customer?.email,
        o.customer?.name,
        o.subtotal,
        o.taxTotal,
        o.discountTotal,
        o.shippingCost,
        o.refundTotal,
        o.total,
        o.cogsTotal,
        o.netProfit,
        o.createdAt ? new Date(o.createdAt).toISOString() : "",
      ])
    );

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=orders-report.csv",
      },
    });
  } catch (error) {
    console.error("GET /api/admin/reports/export error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to export report",
      },
      { status: 500 }
    );
  }
}
