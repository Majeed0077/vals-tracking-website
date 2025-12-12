// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function slugify(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/products/[id] (id can be ObjectId OR slug)
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    await connectDB();

    const { id } = await context.params;
    const idOrSlug = String(id ?? "").trim();

    let product = null;

    if (mongoose.isValidObjectId(idOrSlug)) {
      product = await Product.findById(idOrSlug).lean();
    } else {
      const cleanSlug = slugify(decodeURIComponent(idOrSlug));
      product = await Product.findOne({ slug: cleanSlug }).lean();

      // fallback for old DB slugs like "Basic plan"
      if (!product) {
        const rawDecoded = decodeURIComponent(idOrSlug).trim();
        product = await Product.findOne({
          slug: { $regex: `^${escapeRegex(rawDecoded)}$`, $options: "i" },
        }).lean();
      }
    }

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product }, { status: 200 });
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
        message: error instanceof Error ? error.message : "Failed to fetch product",
      },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] (expects real ObjectId)
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    await connectDB();

    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid product id" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, slug, price, image, category, stock, badge, description } = body;

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // slug changed => normalize + unique check
    if (typeof slug === "string") {
      const nextSlug = slugify(slug);
      if (nextSlug && nextSlug !== product.slug) {
        const existing = await Product.findOne({ slug: nextSlug, _id: { $ne: id } }).lean();
        if (existing) {
          return NextResponse.json(
            { success: false, message: "Slug already exists" },
            { status: 409 }
          );
        }
        product.slug = nextSlug;
      }
    }

    if (name !== undefined) product.name = String(name).trim();
    if (price !== undefined) product.price = Number(price);
    if (image !== undefined) product.image = image;
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = Number(stock);
    if (badge !== undefined) product.badge = badge;
    if (description !== undefined) product.description = description;

    await product.save();

    return NextResponse.json({ success: true, product }, { status: 200 });
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
        message: error instanceof Error ? error.message : "Failed to update product",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] (expects real ObjectId)
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid product id" },
        { status: 400 }
      );
    }

    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
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
        message: error instanceof Error ? error.message : "Failed to delete product",
      },
      { status: 500 }
    );
  }
}
