import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

// POST /api/products – create new product
export async function POST(req: NextRequest) {
  try {
    await connectDB();
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

    // Required fields
    const requiredFields: Record<string, unknown> = {
      name,
      slug,
      price,
      image,
      category,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (value === undefined || value === null || value === "") {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Unique slug check
    const existing = await Product.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Slug already exists" },
        { status: 409 }
      );
    }

    const product = await Product.create({
      name,
      slug,
      price,
      image,
      category,
      stock,
      badge,
    });

    return NextResponse.json(
      { success: true, product },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create product",
      },
      { status: 500 }
    );
  }
}

// GET /api/products – list all products
export async function GET() {
  try {
    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}
