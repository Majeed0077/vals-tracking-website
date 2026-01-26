import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order, { type OrderStatus } from "@/models/Order";

export const dynamic = "force-dynamic";

const ALLOWED_STATUSES: OrderStatus[] = [
  "pending",
  "shipped",
  "delivered",
  "cancelled",
];

export async function GET() {
  try {
    await connectDB();
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const { customer, items, status } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "items are required" },
        { status: 400 }
      );
    }

    const normalizedItems = items.map((item: Record<string, unknown>) => ({
      productId: item.productId,
      name: String(item.name ?? "").trim(),
      price: Number(item.price),
      qty: Number(item.qty),
      image: item.image ? String(item.image).trim() : undefined,
    }));

    if (
      normalizedItems.some(
        (item) =>
          !item.name ||
          Number.isNaN(item.price) ||
          Number.isNaN(item.qty) ||
          item.qty <= 0 ||
          item.price < 0
      )
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid order items" },
        { status: 400 }
      );
    }

    const total = normalizedItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    const nextStatus: OrderStatus = ALLOWED_STATUSES.includes(status)
      ? status
      : "pending";

    const order = await Order.create({
      customer,
      items: normalizedItems,
      total,
      status: nextStatus,
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create order",
      },
      { status: 500 }
    );
  }
}
