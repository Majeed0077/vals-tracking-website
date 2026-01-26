import mongoose, { Schema, models, model } from "mongoose";

export type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled";

export interface IOrderItem {
  productId?: mongoose.Types.ObjectId;
  name: string;
  price: number;
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
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
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
