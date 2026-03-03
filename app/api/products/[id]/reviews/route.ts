import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductReview from "@/models/ProductReview";
import User from "@/models/User";
import { TOKEN_NAME, verifyAuthToken } from "@/lib/auth";
import { enforceRateLimit, enforceSameOrigin, getClientKey } from "@/lib/security";

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

async function resolveProductId(idOrSlug: string) {
  if (mongoose.isValidObjectId(idOrSlug)) {
    const product = await Product.findById(idOrSlug).select("_id").lean<{ _id: mongoose.Types.ObjectId }>();
    return product?._id ?? null;
  }

  const cleanSlug = slugify(decodeURIComponent(idOrSlug));
  if (!cleanSlug) return null;
  const bySlug = await Product.findOne({ slug: cleanSlug }).select("_id").lean<{ _id: mongoose.Types.ObjectId }>();
  return bySlug?._id ?? null;
}

async function getOptionalUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;

  const payload = verifyAuthToken(token);
  if (!payload) return null;

  const user = await User.findById(payload.sub).select("_id name firstName lastName email").lean<{
    _id: mongoose.Types.ObjectId;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  }>();
  if (!user) return null;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return {
    id: user._id,
    name: fullName || user.name || "Customer",
    email: user.email || undefined,
  };
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const { id } = await context.params;
    const productId = await resolveProductId(String(id ?? "").trim());

    if (!productId) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    const [reviews, stats] = await Promise.all([
      ProductReview.find({ productId, isApproved: true })
        .sort({ createdAt: -1 })
        .select("name rating comment createdAt")
        .lean(),
      ProductReview.aggregate<{ _id: mongoose.Types.ObjectId; avgRating: number; reviewCount: number }>([
        { $match: { productId, isApproved: true } },
        {
          $group: {
            _id: "$productId",
            avgRating: { $avg: "$rating" },
            reviewCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const top = stats[0];
    return NextResponse.json(
      {
        success: true,
        reviews,
        stats: {
          avgRating: top ? Number(top.avgRating.toFixed(1)) : 0,
          reviewCount: top ? top.reviewCount : 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/products/[id]/reviews error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const originError = enforceSameOrigin(req);
    if (originError) return originError;

    const rlError = enforceRateLimit(`review-submit:${getClientKey(req)}`, 25, 60_000);
    if (rlError) return rlError;

    await connectDB();
    const { id } = await context.params;
    const productId = await resolveProductId(String(id ?? "").trim());
    if (!productId) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    const body = (await req.json()) as Record<string, unknown>;
    const rating = Number(body.rating ?? 0);
    const comment = String(body.comment ?? "").trim();
    const nameInput = String(body.name ?? "").trim();

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, message: "Rating must be between 1 and 5" }, { status: 400 });
    }
    if (comment.length < 3) {
      return NextResponse.json({ success: false, message: "Comment is too short" }, { status: 400 });
    }

    const authed = await getOptionalUser();
    const review = await ProductReview.create({
      productId,
      userId: authed?.id,
      name: authed?.name || nameInput || "Guest",
      email: authed?.email,
      rating,
      comment,
      isApproved: true,
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    console.error("POST /api/products/[id]/reviews error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to submit review" },
      { status: 500 }
    );
  }
}
