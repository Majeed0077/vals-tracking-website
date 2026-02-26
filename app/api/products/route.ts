// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import InventoryMovement from "@/models/InventoryMovement";
import { requireAdmin } from "@/lib/routeAuth";
import { enforceRateLimit, enforceSameOrigin, getClientKey } from "@/lib/security";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

function slugify(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeVariants(variants: unknown) {
  if (!Array.isArray(variants)) return [];

  type VariantShape = {
    sku: string;
    name: string | undefined;
    priceDelta: number;
    stock: number;
  };

  return variants
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const sku = String(obj.sku ?? "").trim();
      if (!sku) return null;

      return {
        sku,
        name: String(obj.name ?? "").trim() || undefined,
        priceDelta: Number(obj.priceDelta ?? 0) || 0,
        stock: Math.max(0, Number(obj.stock ?? 0) || 0),
      };
    })
    .filter(
      (value): value is VariantShape => value !== null
    );
}

// POST /api/products - create new product
export async function POST(req: NextRequest) {
  try {
    const originError = enforceSameOrigin(req);
    if (originError) return originError;

    const rlError = enforceRateLimit(
      `product-create:${getClientKey(req)}`,
      40,
      60_000
    );
    if (rlError) return rlError;

    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    await connectDB();
    const body = await req.json();

    const {
      name,
      slug,
      sku,
      price,
      costPrice,
      image,
      category,
      stock,
      lowStockThreshold,
      variants,
      badge,
      description,
    } = body;

    const requiredFields: Record<string, unknown> = { name, price, image };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (value === undefined || value === null || value === "") {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const numericPrice = Number(price);
    const numericStock =
      stock === undefined || stock === null || stock === "" ? 0 : Number(stock);
    const numericCost =
      costPrice === undefined || costPrice === null || costPrice === ""
        ? 0
        : Number(costPrice);
    const numericLowStock =
      lowStockThreshold === undefined || lowStockThreshold === null || lowStockThreshold === ""
        ? 5
        : Number(lowStockThreshold);

    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return NextResponse.json(
        { success: false, message: "price must be a non-negative number" },
        { status: 400 }
      );
    }

    if (Number.isNaN(numericStock) || numericStock < 0) {
      return NextResponse.json(
        { success: false, message: "stock must be a non-negative number" },
        { status: 400 }
      );
    }

    if (Number.isNaN(numericCost) || numericCost < 0) {
      return NextResponse.json(
        { success: false, message: "costPrice must be a non-negative number" },
        { status: 400 }
      );
    }

    if (Number.isNaN(numericLowStock) || numericLowStock < 0) {
      return NextResponse.json(
        { success: false, message: "lowStockThreshold must be a non-negative number" },
        { status: 400 }
      );
    }

    const cleanSlug = slugify(slug ?? name);
    if (!cleanSlug) {
      return NextResponse.json(
        { success: false, message: "slug is invalid" },
        { status: 400 }
      );
    }

    const existing = await Product.findOne({ slug: cleanSlug }).lean();
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Slug already exists" },
        { status: 409 }
      );
    }

    const product = await Product.create({
      name: String(name).trim(),
      slug: cleanSlug,
      sku: String(sku ?? "").trim() || undefined,
      price: numericPrice,
      costPrice: numericCost,
      image: String(image),
      category: String(category ?? "").trim() || "general",
      stock: numericStock,
      lowStockThreshold: numericLowStock,
      variants: normalizeVariants(variants),
      badge,
      description: description ?? "",
    });

    if (numericStock > 0) {
      await InventoryMovement.create({
        productId: product._id,
        type: "initial",
        quantity: numericStock,
        reason: "Initial stock on product creation",
        createdBy: auth.payload.email,
      });
    }

    await logAudit({
      action: "product.create",
      actorId: auth.payload.sub,
      actorEmail: auth.payload.email,
      actorRole: auth.payload.role,
      entityType: "Product",
      entityId: product._id.toString(),
      message: `Created product ${product.name}`,
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create product",
      },
      { status: 500 }
    );
  }
}

// GET /api/products - list all products
export async function GET() {
  try {
    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}
