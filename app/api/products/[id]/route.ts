import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// Next 16: params is a Promise, so context type like this:
type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/products/[id]
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    await connectDB();

    const { id } = await context.params; // ⬅️ IMPORTANT

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);

    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json(
        { success: false, message: "Invalid product id" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch product",
      },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id]
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    await connectDB();

    const { id } = await context.params; // ⬅️ IMPORTANT
    const body = await req.json();

    const { name, slug, price, image, category, stock, badge } = body;

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // if slug changed, check uniqueness
    if (slug && slug !== product.slug) {
      const existing = await Product.findOne({
        slug,
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, message: "Slug already exists" },
          { status: 409 }
        );
      }
      product.slug = slug;
    }

    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    if (image !== undefined) product.image = image;
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (badge !== undefined) product.badge = badge;

    await product.save();

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);

    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json(
        { success: false, message: "Invalid product id" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update product",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id]
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    await connectDB();

    const { id } = await context.params; // ⬅️ IMPORTANT

    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);

    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json(
        { success: false, message: "Invalid product id" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete product",
      },
      { status: 500 }
    );
  }
}
