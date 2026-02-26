import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Order, {
  type IOrderCustomer,
  type IOrderItem,
  type OrderStatus,
  type PaymentStatus,
} from "@/models/Order";
import Product from "@/models/Product";
import InventoryMovement from "@/models/InventoryMovement";
import Coupon from "@/models/Coupon";
import { requireAdmin } from "@/lib/routeAuth";
import { enforceRateLimit, enforceSameOrigin, getClientKey } from "@/lib/security";
import { logAudit } from "@/lib/audit";
import { upsertCustomerFromOrder } from "@/lib/crm";
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

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

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
    const originError = enforceSameOrigin(req);
    if (originError) return originError;

    const rlError = enforceRateLimit(`order-create:${getClientKey(req)}`, 25, 60_000);
    if (rlError) return rlError;

    await connectDB();
    const body = await req.json();

    const {
      customer,
      items,
      status,
      paymentStatus,
      shippingCost,
      taxTotal,
      discountTotal,
      couponCode,
    } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "items are required" },
        { status: 400 }
      );
    }

    const normalizedCustomer: IOrderCustomer | undefined =
      customer && typeof customer === "object"
        ? {
            name: typeof customer.name === "string" ? customer.name.trim() : undefined,
            email: typeof customer.email === "string" ? customer.email.trim() : undefined,
            phone: typeof customer.phone === "string" ? customer.phone.trim() : undefined,
            address: typeof customer.address === "string" ? customer.address.trim() : undefined,
          }
        : undefined;

    const normalizedItems: IOrderItem[] = [];

    for (const rawItem of items as Array<Record<string, unknown>>) {
      const rawId = rawItem.productId;
      let productId: mongoose.Types.ObjectId | undefined;

      if (rawId instanceof mongoose.Types.ObjectId) {
        productId = rawId;
      } else if (typeof rawId === "string" && mongoose.Types.ObjectId.isValid(rawId)) {
        productId = new mongoose.Types.ObjectId(rawId);
      }

      const qty = Number(rawItem.qty);
      const price = Number(rawItem.price);
      if (!qty || Number.isNaN(qty) || Number.isNaN(price) || qty <= 0 || price < 0) {
        return NextResponse.json(
          { success: false, message: "Invalid order items" },
          { status: 400 }
        );
      }

      let resolvedCost = Number(rawItem.costPrice ?? 0);
      let resolvedSku = String(rawItem.sku ?? "").trim() || undefined;

      if (productId) {
        const product = await Product.findById(productId)
          .select("costPrice sku stock")
          .lean<{ costPrice?: number; sku?: string; stock?: number }>();

        if (product) {
          resolvedCost = Number(product.costPrice ?? 0);
          if (!resolvedSku && product.sku) resolvedSku = product.sku;

          if (typeof product.stock === "number") {
            const newStock = Math.max(0, product.stock - qty);
            await Product.findByIdAndUpdate(productId, { stock: newStock });
            await InventoryMovement.create({
              productId,
              type: "sale",
              quantity: -qty,
              reason: "Stock deducted on order create",
              note: "Order placement",
            });
          }
        }
      }

      normalizedItems.push({
        productId,
        sku: resolvedSku,
        name: String(rawItem.name ?? "").trim(),
        price,
        costPrice: Number.isNaN(resolvedCost) ? 0 : Math.max(0, resolvedCost),
        qty,
        image: rawItem.image ? String(rawItem.image).trim() : undefined,
      });
    }

    const subtotal = normalizedItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const cogsTotal = normalizedItems.reduce(
      (sum, item) => sum + (item.costPrice ?? 0) * item.qty,
      0
    );

    let cleanDiscount = Math.max(0, Number(discountTotal ?? 0) || 0);
    const cleanTax = Math.max(0, Number(taxTotal ?? 0) || 0);
    const cleanShipping = Math.max(0, Number(shippingCost ?? 0) || 0);

    let appliedCouponCode: string | undefined;
    if (couponCode) {
      const code = String(couponCode).trim().toUpperCase();
      const coupon = await Coupon.findOne({ code, isActive: true });
      if (coupon) {
        const now = new Date();
        const inWindow =
          (!coupon.validFrom || coupon.validFrom <= now) &&
          (!coupon.validUntil || coupon.validUntil >= now);
        const usageAvailable =
          coupon.usageLimit == null || coupon.usedCount < coupon.usageLimit;
        const minOrderOk = subtotal >= (coupon.minOrderTotal ?? 0);

        if (inWindow && usageAvailable && minOrderOk) {
          let couponDiscount =
            coupon.type === "percentage"
              ? (subtotal * Number(coupon.value || 0)) / 100
              : Number(coupon.value || 0);

          if (coupon.maxDiscount != null) {
            couponDiscount = Math.min(couponDiscount, Number(coupon.maxDiscount || 0));
          }
          cleanDiscount = Math.max(cleanDiscount, Math.max(0, couponDiscount));
          appliedCouponCode = coupon.code;
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    const total = Math.max(0, subtotal - cleanDiscount + cleanTax + cleanShipping);

    const nextStatus: OrderStatus = ALLOWED_STATUSES.includes(status) ? status : "pending";
    const nextPayment: PaymentStatus = ALLOWED_PAYMENT.includes(paymentStatus)
      ? paymentStatus
      : "unpaid";

    const grossProfit = total - cogsTotal;
    const netProfit = grossProfit - cleanShipping;

    const order = await Order.create({
      customer: normalizedCustomer,
      items: normalizedItems,
      subtotal,
      discountTotal: cleanDiscount,
      taxTotal: cleanTax,
      shippingCost: cleanShipping,
      refundTotal: 0,
      cogsTotal,
      grossProfit,
      netProfit,
      currency: "PKR",
      paymentStatus: nextPayment,
      timeline: [
        {
          type: "order_created",
          message: "Order created",
          by: normalizedCustomer?.email || normalizedCustomer?.name || "system",
          at: new Date(),
        },
        ...(appliedCouponCode
          ? [
              {
                type: "coupon_applied",
                message: `Coupon ${appliedCouponCode} applied`,
                by: normalizedCustomer?.email || normalizedCustomer?.name || "system",
                at: new Date(),
              },
            ]
          : []),
      ],
      total,
      status: nextStatus,
    });

    await upsertCustomerFromOrder({
      email: normalizedCustomer?.email,
      name: normalizedCustomer?.name,
      phone: normalizedCustomer?.phone,
      address: normalizedCustomer?.address,
      orderTotal: total,
      orderDate: new Date(),
    });

    await logAudit({
      action: "order.create",
      entityType: "Order",
      entityId: order._id.toString(),
      message: `Order ${order._id.toString()} created`,
      meta: { status: nextStatus, paymentStatus: nextPayment, total },
    });

    if (normalizedCustomer?.email) {
      await notify({
        channel: "email",
        to: normalizedCustomer.email,
        subject: "Order placed successfully",
        message: `Your order has been placed. Order ID: ${order._id.toString()}`,
        templateKey: "order_created",
        relatedEntityType: "Order",
        relatedEntityId: order._id.toString(),
      });
    }

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
