import mongoose, { Schema, model, models } from "mongoose";

export type InventoryMovementType =
  | "initial"
  | "purchase"
  | "sale"
  | "adjustment"
  | "return"
  | "delete";

export interface IInventoryMovement extends mongoose.Document {
  productId: mongoose.Types.ObjectId;
  variantSku?: string;
  type: InventoryMovementType;
  quantity: number;
  reason?: string;
  note?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryMovementSchema = new Schema<IInventoryMovement>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantSku: { type: String, trim: true },
    type: {
      type: String,
      enum: ["initial", "purchase", "sale", "adjustment", "return", "delete"],
      required: true,
    },
    quantity: { type: Number, required: true },
    reason: { type: String, trim: true },
    note: { type: String, trim: true },
    createdBy: { type: String, trim: true },
  },
  { timestamps: true }
);

const InventoryMovement =
  (models.InventoryMovement as mongoose.Model<IInventoryMovement>) ||
  model<IInventoryMovement>("InventoryMovement", InventoryMovementSchema);

export default InventoryMovement;
