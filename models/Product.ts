import mongoose, { Schema, models, model } from "mongoose";

export interface IProduct extends mongoose.Document {
  name: string;
  slug: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  badge?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
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
    badge: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      default: "",
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
