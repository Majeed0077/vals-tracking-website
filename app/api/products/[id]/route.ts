import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import mongoose from "mongoose";

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/products/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid product id" },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch product",
      },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid product id" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      name,
      slug,
      price,
      image,
      category,
      stock,
      badge,
    } = body;

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // If slug is changing, enforce uniqueness
    if (slug && slug !== product.slug) {
      const existing = await Product.findOne({
        slug,
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: "Slug already exists" },
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
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update product",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid product id" },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete product",
      },
      { status: 500 }
    );
  }
}
