import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PaymentTransaction from "@/models/PaymentTransaction";
import Order from "@/models/Order";
import { notify } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const providerRef = String(body.providerRef ?? "");
    const status = String(body.status ?? "");

    if (!providerRef || !status) {
      return NextResponse.json(
        { success: false, message: "providerRef and status are required" },
        { status: 400 }
      );
    }

    const tx = await PaymentTransaction.findOne({ providerRef });
    if (!tx) {
      return NextResponse.json(
        { success: false, message: "Transaction not found" },
        { status: 404 }
      );
    }

    if (status === "captured" || status === "authorized") {
      tx.status = status;
    } else if (status === "refunded") {
      tx.status = "refunded";
    } else if (status === "failed") {
      tx.status = "failed";
      tx.failureReason = String(body.failureReason ?? "Provider reported failure");
    } else {
      return NextResponse.json(
        { success: false, message: "Unsupported payment webhook status" },
        { status: 400 }
      );
    }
    await tx.save();

    const order = await Order.findById(tx.orderId);
    if (order) {
      if (tx.status === "captured" || tx.status === "authorized") {
        order.paymentStatus = "paid";
        order.paymentReference = tx.providerRef;
        order.paymentMethod = tx.provider;
        if (!order.paidAt) order.paidAt = new Date();
      } else if (tx.status === "refunded") {
        order.paymentStatus = "refunded";
      } else if (tx.status === "failed") {
        order.paymentStatus = "unpaid";
      }

      order.timeline.push({
        type: "payment_webhook",
        message: `Payment webhook: ${tx.status}`,
        by: "provider",
        at: new Date(),
        meta: { providerRef: tx.providerRef, provider: tx.provider },
      });
      await order.save();

      if (order.customer?.email) {
        await notify({
          channel: "email",
          to: order.customer.email,
          subject: "Payment status updated",
          message: `Your payment status is now ${order.paymentStatus}.`,
          templateKey: "payment_status_updated",
          relatedEntityType: "Order",
          relatedEntityId: order._id.toString(),
        });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("POST /api/payments/webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to process payment webhook",
      },
      { status: 500 }
    );
  }
}
