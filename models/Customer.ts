import mongoose, { Schema, model, models } from "mongoose";

export type CustomerSegment = "new" | "repeat" | "high_value" | "at_risk";

export interface ICustomer extends mongoose.Document {
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  orderCount: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderAt?: Date;
  firstOrderAt?: Date;
  ltv: number;
  segment: CustomerSegment;
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    orderCount: { type: Number, default: 0, min: 0 },
    totalSpent: { type: Number, default: 0, min: 0 },
    averageOrderValue: { type: Number, default: 0, min: 0 },
    lastOrderAt: { type: Date },
    firstOrderAt: { type: Date },
    ltv: { type: Number, default: 0, min: 0 },
    segment: {
      type: String,
      enum: ["new", "repeat", "high_value", "at_risk"],
      default: "new",
    },
    tags: { type: [String], default: [] },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

const Customer =
  (models.Customer as mongoose.Model<ICustomer>) ||
  model<ICustomer>("Customer", CustomerSchema);

export default Customer;
