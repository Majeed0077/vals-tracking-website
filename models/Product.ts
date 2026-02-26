import mongoose, { Schema, models, model } from "mongoose";

export interface IProduct extends mongoose.Document {
  name: string;
  slug: string;
  sku?: string;
  price: number;
  costPrice: number;
  image: string;
  category: string;
  stock: number;
  lowStockThreshold: number;
  variants: Array<{
    sku: string;
    name?: string;
    priceDelta: number;
    stock: number;
  }>;
  badge?: string;
  description?: string;
  discount?: {
    type: "percentage" | "fixed";
    value: number;
    startAt?: Date;
    endAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema(
  {
    sku: { type: String, required: true, trim: true },
    name: { type: String, trim: true },
    priceDelta: { type: Number, default: 0 },
    stock: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    costPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
    },
    variants: {
      type: [ProductVariantSchema],
      default: [],
    },
    badge: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    discount: {
      type: {
        type: String,
        enum: ["percentage", "fixed"],
      },
      value: {
        type: Number,
        min: 0,
      },
      startAt: {
        type: Date,
      },
      endAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Product =
  (models.Product as mongoose.Model<IProduct>) ||
  model<IProduct>("Product", ProductSchema);

export default Product;
