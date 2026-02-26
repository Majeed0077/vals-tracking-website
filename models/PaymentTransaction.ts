import mongoose, { Schema, model, models } from "mongoose";

export type PaymentProvider = "mock" | "stripe" | "jazzcash" | "easypaisa";
export type PaymentTxStatus = "pending" | "authorized" | "captured" | "failed" | "refunded";

export interface IPaymentTransaction extends mongoose.Document {
  orderId: mongoose.Types.ObjectId;
  provider: PaymentProvider;
  providerRef?: string;
  amount: number;
  currency: string;
  status: PaymentTxStatus;
  paymentUrl?: string;
  failureReason?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentTransactionSchema = new Schema<IPaymentTransaction>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    provider: {
      type: String,
      enum: ["mock", "stripe", "jazzcash", "easypaisa"],
      required: true,
    },
    providerRef: { type: String, trim: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "PKR", trim: true },
    status: {
      type: String,
      enum: ["pending", "authorized", "captured", "failed", "refunded"],
      default: "pending",
    },
    paymentUrl: { type: String, trim: true },
    failureReason: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const PaymentTransaction =
  (models.PaymentTransaction as mongoose.Model<IPaymentTransaction>) ||
  model<IPaymentTransaction>("PaymentTransaction", PaymentTransactionSchema);

export default PaymentTransaction;
