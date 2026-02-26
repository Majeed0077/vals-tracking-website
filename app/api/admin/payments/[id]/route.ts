import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import PaymentTransaction from "@/models/PaymentTransaction";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/routeAuth";
import { enforceRateLimit, enforceSameOrigin, getClientKey } from "@/lib/security";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const ALLOWED_STATUS = ["pending", "authorized", "captured", "failed", "refunded"] as const;
type AllowedStatus = (typeof ALLOWED_STATUS)[number];

function orderPaymentStatusFromTxStatus(status: AllowedStatus): "unpaid" | "paid" | "refunded" {
  if (status === "authorized" || status === "captured") return "paid";
  if (status === "refunded") return "refunded";
  return "unpaid";
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const originError = enforceSameOrigin(req);
    if (originError) return originError;

    const rlError = enforceRateLimit(`payment-admin-update:${getClientKey(req)}`, 40, 60_000);
    if (rlError) return rlError;

    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid transaction id" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const status = String(body.status || "").trim() as AllowedStatus;
    if (!ALLOWED_STATUS.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid payment status" },
        { status: 400 }
      );
    }

    await connectDB();

    const tx = await PaymentTransaction.findById(id);
    if (!tx) {
      return NextResponse.json(
        { success: false, message: "Payment transaction not found" },
        { status: 404 }
      );
    }

    tx.status = status;
    if (status === "failed") {
      tx.failureReason = String(body.failureReason || "Marked failed by admin").trim();
    } else {
      tx.failureReason = undefined;
    }
    await tx.save();

    const order = await Order.findById(tx.orderId);
    if (order) {
      order.paymentStatus = orderPaymentStatusFromTxStatus(status);
      order.paymentMethod = tx.provider;
      order.paymentReference = tx.providerRef;
      if (order.paymentStatus === "paid" && !order.paidAt) {
        order.paidAt = new Date();
      }

      order.timeline.push({
        type: "payment_admin_update",
        message: `Payment status changed to ${status} by admin`,
        by: auth.payload.email,
        at: new Date(),
        meta: { txId: tx._id.toString(), provider: tx.provider, providerRef: tx.providerRef },
      });

      await order.save();

      await logAudit({
        action: "payment.transaction.update",
        actorId: auth.payload.sub,
        actorEmail: auth.payload.email,
        actorRole: auth.payload.role,
        entityType: "PaymentTransaction",
        entityId: tx._id.toString(),
        message: `Updated payment transaction ${tx._id.toString()} to ${status}`,
        meta: { orderId: order._id.toString(), provider: tx.provider },
      });
    }

    return NextResponse.json({ success: true, transaction: tx }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/admin/payments/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update payment",
      },
      { status: 500 }
    );
  }
}
