import mongoose, { Schema, model, models } from "mongoose";

export type CouponType = "percentage" | "fixed";

export interface ICoupon extends mongoose.Document {
  code: string;
  type: CouponType;
  value: number;
  minOrderTotal: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom?: Date;
  validUntil?: Date;
  isActive: boolean;
  appliesToCategories: string[];
  appliesToProductIds: mongoose.Types.ObjectId[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderTotal: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    usageLimit: { type: Number, min: 0 },
    usedCount: { type: Number, default: 0, min: 0 },
    validFrom: { type: Date },
    validUntil: { type: Date },
    isActive: { type: Boolean, default: true },
    appliesToCategories: { type: [String], default: [] },
    appliesToProductIds: { type: [Schema.Types.ObjectId], ref: "Product", default: [] },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

const Coupon =
  (models.Coupon as mongoose.Model<ICoupon>) ||
  model<ICoupon>("Coupon", CouponSchema);

export default Coupon;
