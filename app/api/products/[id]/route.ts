// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import InventoryMovement from "@/models/InventoryMovement";
import { requireAdmin } from "@/lib/routeAuth";
import { enforceRateLimit, enforceSameOrigin, getClientKey } from "@/lib/security";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notifications";

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

function normalizeVariants(variants: unknown) {
  if (!Array.isArray(variants)) return undefined;

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

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const originError = enforceSameOrigin(req);
    if (originError) return originError;

    const rlError = enforceRateLimit(`product-update:${getClientKey(req)}`, 60, 60_000);
    if (rlError) return rlError;

    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    await connectDB();

    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid product id" },
        { status: 400 }
      );
    }

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

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    const prevStock = product.stock ?? 0;

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
    if (sku !== undefined) product.sku = String(sku ?? "").trim() || undefined;
    if (price !== undefined) {
      const numericPrice = Number(price);
      if (Number.isNaN(numericPrice) || numericPrice < 0) {
        return NextResponse.json(
          { success: false, message: "price must be a non-negative number" },
          { status: 400 }
        );
      }
      product.price = numericPrice;
    }

    if (costPrice !== undefined) {
      const numericCost = Number(costPrice);
      if (Number.isNaN(numericCost) || numericCost < 0) {
        return NextResponse.json(
          { success: false, message: "costPrice must be a non-negative number" },
          { status: 400 }
        );
      }
      product.costPrice = numericCost;
    }

    if (image !== undefined) product.image = String(image);
    if (category !== undefined) product.category = String(category ?? "").trim() || "general";

    if (stock !== undefined) {
      const numericStock = Number(stock);
      if (Number.isNaN(numericStock) || numericStock < 0) {
        return NextResponse.json(
          { success: false, message: "stock must be a non-negative number" },
          { status: 400 }
        );
      }
      product.stock = numericStock;
    }

    if (lowStockThreshold !== undefined) {
      const threshold = Number(lowStockThreshold);
      if (Number.isNaN(threshold) || threshold < 0) {
        return NextResponse.json(
          { success: false, message: "lowStockThreshold must be a non-negative number" },
          { status: 400 }
        );
      }
      product.lowStockThreshold = threshold;
    }

    if (variants !== undefined) {
      product.variants = normalizeVariants(variants) ?? [];
    }

    if (badge !== undefined) product.badge = badge;
    if (description !== undefined) product.description = description;

    await product.save();

    if (stock !== undefined && product.stock !== prevStock) {
      const delta = product.stock - prevStock;
      await InventoryMovement.create({
        productId: product._id,
        type: "adjustment",
        quantity: delta,
        reason: "Manual stock update",
        createdBy: auth.payload.email,
      });
    }

    await logAudit({
      action: "product.update",
      actorId: auth.payload.sub,
      actorEmail: auth.payload.email,
      actorRole: auth.payload.role,
      entityType: "Product",
      entityId: product._id.toString(),
      message: `Updated product ${product.name}`,
    });

    if ((product.stock ?? 0) <= (product.lowStockThreshold ?? 0)) {
      await notify({
        channel: "in_app",
        to: "admin",
        message: `Low stock alert: ${product.name} has ${product.stock} units left.`,
        templateKey: "low_stock_alert",
        relatedEntityType: "Product",
        relatedEntityId: product._id.toString(),
      });
    }

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

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const originError = enforceSameOrigin(req);
    if (originError) return originError;

    const rlError = enforceRateLimit(`product-delete:${getClientKey(req)}`, 30, 60_000);
    if (rlError) return rlError;

    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

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

    if ((deleted.stock ?? 0) > 0) {
      await InventoryMovement.create({
        productId: deleted._id,
        type: "delete",
        quantity: -Math.abs(deleted.stock ?? 0),
        reason: "Product deleted",
        createdBy: auth.payload.email,
      });
    }

    await logAudit({
      action: "product.delete",
      actorId: auth.payload.sub,
      actorEmail: auth.payload.email,
      actorRole: auth.payload.role,
      entityType: "Product",
      entityId: deleted._id.toString(),
      message: `Deleted product ${deleted.name}`,
    });

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
