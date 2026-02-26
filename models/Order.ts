import mongoose, { Schema, models, model } from "mongoose";

export type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "partially_refunded" | "refunded";

export interface IOrderItem {
  productId?: mongoose.Types.ObjectId;
  sku?: string;
  name: string;
  price: number;
  costPrice?: number;
  qty: number;
  image?: string;
}

export interface IOrderCustomer {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface IOrder extends mongoose.Document {
  customer?: IOrderCustomer;
  items: IOrderItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingCost: number;
  refundTotal: number;
  cogsTotal: number;
  grossProfit: number;
  netProfit: number;
  currency: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  paymentReference?: string;
  paidAt?: Date;
  fulfillment?: {
    carrier?: string;
    trackingId?: string;
    trackingUrl?: string;
    shippedAt?: Date;
    deliveredAt?: Date;
  };
  notes: Array<{
    text: string;
    by?: string;
    createdAt: Date;
  }>;
  returns: Array<{
    reason?: string;
    amount: number;
    status: "requested" | "approved" | "rejected" | "refunded";
    createdAt: Date;
  }>;
  timeline: Array<{
    type: string;
    message: string;
    by?: string;
    at: Date;
    meta?: Record<string, unknown>;
  }>;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    sku: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, min: 0, default: 0 },
    qty: { type: Number, required: true, min: 1 },
    image: { type: String, trim: true },
  },
  { _id: false }
);

const OrderCustomerSchema = new Schema<IOrderCustomer>(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    customer: { type: OrderCustomerSchema, default: undefined },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, default: 0, min: 0 },
    discountTotal: { type: Number, default: 0, min: 0 },
    taxTotal: { type: Number, default: 0, min: 0 },
    shippingCost: { type: Number, default: 0, min: 0 },
    refundTotal: { type: Number, default: 0, min: 0 },
    cogsTotal: { type: Number, default: 0, min: 0 },
    grossProfit: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0 },
    currency: { type: String, default: "PKR", trim: true },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "partially_refunded", "refunded"],
      default: "unpaid",
    },
    paymentMethod: { type: String, trim: true },
    paymentReference: { type: String, trim: true },
    paidAt: { type: Date },
    fulfillment: {
      carrier: { type: String, trim: true },
      trackingId: { type: String, trim: true },
      trackingUrl: { type: String, trim: true },
      shippedAt: { type: Date },
      deliveredAt: { type: Date },
    },
    notes: {
      type: [
        {
          text: { type: String, required: true, trim: true },
          by: { type: String, trim: true },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    returns: {
      type: [
        {
          reason: { type: String, trim: true },
          amount: { type: Number, required: true, min: 0 },
          status: {
            type: String,
            enum: ["requested", "approved", "rejected", "refunded"],
            default: "requested",
          },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    timeline: {
      type: [
        {
          type: { type: String, required: true, trim: true },
          message: { type: String, required: true, trim: true },
          by: { type: String, trim: true },
          at: { type: Date, default: Date.now },
          meta: { type: Schema.Types.Mixed },
        },
      ],
      default: [],
    },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Order =
  (models.Order as mongoose.Model<IOrder>) ||
  model<IOrder>("Order", OrderSchema);

export default Order;
