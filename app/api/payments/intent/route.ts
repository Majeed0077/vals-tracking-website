import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/routeAuth";
import { enforceRateLimit, enforceSameOrigin, getClientKey } from "@/lib/security";
import Order from "@/models/Order";
import PaymentTransaction, { type PaymentProvider } from "@/models/PaymentTransaction";
import { createPaymentIntent } from "@/lib/payments";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notifications";

export const dynamic = "force-dynamic";

const ALLOWED_PROVIDERS: PaymentProvider[] = ["mock", "stripe", "jazzcash", "easypaisa"];

export async function POST(req: NextRequest) {
  try {
    const originError = enforceSameOrigin(req);
    if (originError) return originError;

    const rlError = enforceRateLimit(`payment-intent:${getClientKey(req)}`, 40, 60_000);
    if (rlError) return rlError;

    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    await connectDB();
    const body = await req.json();

    const orderId = String(body.orderId ?? "");
    const provider = body.provider as PaymentProvider;

    if (!mongoose.isValidObjectId(orderId)) {
      return NextResponse.json(
        { success: false, message: "Invalid orderId" },
        { status: 400 }
      );
    }
    if (!ALLOWED_PROVIDERS.includes(provider)) {
      return NextResponse.json(
        { success: false, message: "Invalid payment provider" },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const intent = await createPaymentIntent({
      provider,
      amount: order.total,
      currency: order.currency || "PKR",
      orderId,
      customerEmail: order.customer?.email,
    });

    const tx = await PaymentTransaction.create({
      orderId: order._id,
      provider,
      providerRef: intent.providerRef,
      amount: order.total,
      currency: order.currency || "PKR",
      status: intent.status === "authorized" ? "authorized" : "pending",
      paymentUrl: intent.paymentUrl,
      metadata: { createdBy: auth.payload.email },
    });

    if (intent.status === "authorized") {
      order.paymentStatus = "paid";
      order.paymentMethod = provider;
      order.paymentReference = intent.providerRef;
      order.paidAt = new Date();
      order.timeline.push({
        type: "payment_authorized",
        message: `Payment authorized via ${provider}`,
        by: auth.payload.email,
        at: new Date(),
      });
      await order.save();
    }

    await logAudit({
      action: "payment.intent.create",
      actorId: auth.payload.sub,
      actorEmail: auth.payload.email,
      actorRole: auth.payload.role,
      entityType: "Order",
      entityId: order._id.toString(),
      message: `Payment intent created for order ${order._id.toString()}`,
      meta: { provider, providerRef: tx.providerRef, amount: tx.amount },
    });

    if (order.customer?.email) {
      await notify({
        channel: "email",
        to: order.customer.email,
        subject: "Payment link generated",
        message: `Payment link generated for your order ${order._id.toString()}.`,
        templateKey: "payment_intent_created",
        relatedEntityType: "Order",
        relatedEntityId: order._id.toString(),
      });
    }

    return NextResponse.json(
      {
        success: true,
        transaction: tx,
        paymentUrl: intent.paymentUrl || null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/payments/intent error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create payment intent",
      },
      { status: 500 }
    );
  }
}
