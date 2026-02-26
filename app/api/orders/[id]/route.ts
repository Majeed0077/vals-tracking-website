import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Order, { type OrderStatus, type PaymentStatus } from "@/models/Order";
import Product from "@/models/Product";
import InventoryMovement from "@/models/InventoryMovement";
import { requireAdmin } from "@/lib/routeAuth";
import { enforceRateLimit, enforceSameOrigin, getClientKey } from "@/lib/security";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notifications";

export const dynamic = "force-dynamic";

const ALLOWED_STATUSES: OrderStatus[] = [
  "pending",
  "shipped",
  "delivered",
  "cancelled",
];

const ALLOWED_PAYMENT: PaymentStatus[] = [
  "unpaid",
  "paid",
  "partially_refunded",
  "refunded",
];

function recomputeFinancials(order: {
  items: Array<{ price: number; qty: number; costPrice?: number }>;
  discountTotal?: number;
  taxTotal?: number;
  shippingCost?: number;
  refundTotal?: number;
}) {
  const subtotal = order.items.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
  const cogsTotal = order.items.reduce(
    (sum, item) => sum + Number(item.costPrice ?? 0) * Number(item.qty),
    0
  );
  const discountTotal = Math.max(0, Number(order.discountTotal ?? 0) || 0);
  const taxTotal = Math.max(0, Number(order.taxTotal ?? 0) || 0);
  const shippingCost = Math.max(0, Number(order.shippingCost ?? 0) || 0);
  const refundTotal = Math.max(0, Number(order.refundTotal ?? 0) || 0);

  const total = Math.max(0, subtotal - discountTotal + taxTotal + shippingCost);
  const grossProfit = total - cogsTotal;
  const netProfit = grossProfit - shippingCost - refundTotal;

  return {
    subtotal,
    cogsTotal,
    discountTotal,
    taxTotal,
    shippingCost,
    refundTotal,
    total,
    grossProfit,
    netProfit,
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const { id } = await params;
    await connectDB();

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order id" },
        { status: 400 }
      );
    }

    const order = await Order.findById(id).lean();
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch order",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const originError = enforceSameOrigin(req);
    if (originError) return originError;

    const rlError = enforceRateLimit(`order-update:${getClientKey(req)}`, 80, 60_000);
    if (rlError) return rlError;

    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const { id } = await params;
    await connectDB();

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order id" },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const body = await req.json();

    if (body.status !== undefined) {
      if (!ALLOWED_STATUSES.includes(body.status)) {
        return NextResponse.json(
          { success: false, message: "Invalid status" },
          { status: 400 }
        );
      }
      order.status = body.status;
      order.timeline.push({
        type: "status_updated",
        message: `Status changed to ${body.status}`,
        by: auth.payload.email,
        at: new Date(),
      });
    }

    if (body.paymentStatus !== undefined) {
      if (!ALLOWED_PAYMENT.includes(body.paymentStatus)) {
        return NextResponse.json(
          { success: false, message: "Invalid payment status" },
          { status: 400 }
        );
      }
      order.paymentStatus = body.paymentStatus;
      if (body.paymentStatus === "paid" && !order.paidAt) {
        order.paidAt = new Date();
      }
      order.timeline.push({
        type: "payment_updated",
        message: `Payment status changed to ${body.paymentStatus}`,
        by: auth.payload.email,
        at: new Date(),
      });
    }

    if (body.paymentMethod !== undefined) order.paymentMethod = String(body.paymentMethod || "").trim() || undefined;
    if (body.paymentReference !== undefined) order.paymentReference = String(body.paymentReference || "").trim() || undefined;

    if (body.fulfillment && typeof body.fulfillment === "object") {
      order.fulfillment = {
        ...order.fulfillment,
        carrier:
          body.fulfillment.carrier !== undefined
            ? String(body.fulfillment.carrier || "").trim() || undefined
            : order.fulfillment?.carrier,
        trackingId:
          body.fulfillment.trackingId !== undefined
            ? String(body.fulfillment.trackingId || "").trim() || undefined
            : order.fulfillment?.trackingId,
        trackingUrl:
          body.fulfillment.trackingUrl !== undefined
            ? String(body.fulfillment.trackingUrl || "").trim() || undefined
            : order.fulfillment?.trackingUrl,
      };

      if (body.fulfillment.markShipped) {
        order.fulfillment.shippedAt = new Date();
        order.status = "shipped";
      }
      if (body.fulfillment.markDelivered) {
        order.fulfillment.deliveredAt = new Date();
        order.status = "delivered";
      }

      order.timeline.push({
        type: "fulfillment_updated",
        message: "Fulfillment details updated",
        by: auth.payload.email,
        at: new Date(),
      });
    }

    if (typeof body.addNote === "string" && body.addNote.trim()) {
      order.notes.push({
        text: body.addNote.trim(),
        by: auth.payload.email,
        createdAt: new Date(),
      });
      order.timeline.push({
        type: "note_added",
        message: "Order note added",
        by: auth.payload.email,
        at: new Date(),
      });
    }

    if (body.returnRequest && typeof body.returnRequest === "object") {
      const amount = Math.max(0, Number(body.returnRequest.amount ?? 0) || 0);
      if (amount > 0) {
        order.returns.push({
          reason: String(body.returnRequest.reason ?? "").trim() || undefined,
          amount,
          status: "requested",
          createdAt: new Date(),
        });
        order.timeline.push({
          type: "return_requested",
          message: `Return requested for Rs ${amount}`,
          by: auth.payload.email,
          at: new Date(),
        });
      }
    }

    if (body.accounting && typeof body.accounting === "object") {
      if (body.accounting.shippingCost !== undefined) {
        order.shippingCost = Math.max(0, Number(body.accounting.shippingCost) || 0);
      }
      if (body.accounting.discountTotal !== undefined) {
        order.discountTotal = Math.max(0, Number(body.accounting.discountTotal) || 0);
      }
      if (body.accounting.taxTotal !== undefined) {
        order.taxTotal = Math.max(0, Number(body.accounting.taxTotal) || 0);
      }
      if (body.accounting.refundTotal !== undefined) {
        order.refundTotal = Math.max(0, Number(body.accounting.refundTotal) || 0);
      }

      order.timeline.push({
        type: "accounting_updated",
        message: "Order accounting fields updated",
        by: auth.payload.email,
        at: new Date(),
      });
    }

    const recomputed = recomputeFinancials(order);
    order.subtotal = recomputed.subtotal;
    order.discountTotal = recomputed.discountTotal;
    order.taxTotal = recomputed.taxTotal;
    order.shippingCost = recomputed.shippingCost;
    order.refundTotal = recomputed.refundTotal;
    order.cogsTotal = recomputed.cogsTotal;
    order.total = recomputed.total;
    order.grossProfit = recomputed.grossProfit;
    order.netProfit = recomputed.netProfit;

    if (order.status === "cancelled") {
      for (const item of order.items) {
        if (item.productId && mongoose.isValidObjectId(item.productId)) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: Number(item.qty) || 0 },
          });
          await InventoryMovement.create({
            productId: item.productId,
            type: "return",
            quantity: Number(item.qty) || 0,
            reason: "Stock restored due to order cancellation",
            createdBy: auth.payload.email,
          });
        }
      }
    }

    await order.save();

    await logAudit({
      action: "order.update",
      actorId: auth.payload.sub,
      actorEmail: auth.payload.email,
      actorRole: auth.payload.role,
      entityType: "Order",
      entityId: order._id.toString(),
      message: `Updated order ${order._id.toString()}`,
      meta: {
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: order.total,
      },
    });

    if (order.customer?.email) {
      await notify({
        channel: "email",
        to: order.customer.email,
        subject: "Order updated",
        message: `Your order ${order._id.toString()} status is ${order.status} and payment is ${order.paymentStatus}.`,
        templateKey: "order_updated",
        relatedEntityType: "Order",
        relatedEntityId: order._id.toString(),
      });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("PUT /api/orders/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update order",
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

    const rlError = enforceRateLimit(`order-delete:${getClientKey(req)}`, 30, 60_000);
    if (rlError) return rlError;

    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const { id } = await params;
    await connectDB();

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order id" },
        { status: 400 }
      );
    }

    const order = await Order.findByIdAndDelete(id).lean();
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    await logAudit({
      action: "order.delete",
      actorId: auth.payload.sub,
      actorEmail: auth.payload.email,
      actorRole: auth.payload.role,
      entityType: "Order",
      entityId: order._id.toString(),
      message: `Deleted order ${order._id.toString()}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/orders/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete order",
      },
      { status: 500 }
    );
  }
}
