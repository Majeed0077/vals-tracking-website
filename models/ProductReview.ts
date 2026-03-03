import mongoose, { Schema, model, models } from "mongoose";

export interface IProductReview extends mongoose.Document {
  productId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductReviewSchema = new Schema<IProductReview>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, trim: true, lowercase: true, maxlength: 120 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, minlength: 3, maxlength: 900 },
    isApproved: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

ProductReviewSchema.index({ productId: 1, createdAt: -1 });

const ProductReview =
  (models.ProductReview as mongoose.Model<IProductReview>) ||
  model<IProductReview>("ProductReview", ProductReviewSchema);

export default ProductReview;
