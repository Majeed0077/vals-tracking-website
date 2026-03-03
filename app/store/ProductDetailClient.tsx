"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BuyNowActions from "@/app/components/BuyNowActions";
import ProductDetailRows from "@/app/store/components/ProductDetailRows";
import { resolveProductPricing } from "@/lib/productPricing";

type ProductShape = {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  discount?: {
    type: "percentage" | "fixed";
    value: number;
    startAt?: string | Date;
    endAt?: string | Date;
  };
  badge?: string;
  category?: string;
  stock?: number;
  avgRating?: number;
  reviewCount?: number;
};

type ProductReview = {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt?: string;
};

type ProductDetailConfig = {
  deliveryLocation: string;
  standardDeliveryFee: number;
  collectionPointFee: number;
  codLabel: string;
  returnPolicy: string;
  warrantyLabel: string;
  sellerName: string;
  sellerRating: number;
  shipOnTime: number;
  responseTime: string;
};

type ProductDetailClientProps = {
  slug: string;
};

function normalizeProduct(value: unknown): ProductShape | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const rawId = raw._id;

  const id =
    typeof rawId === "string"
      ? rawId
      : rawId && typeof rawId === "object" && "toString" in rawId
        ? String((rawId as { toString(): string }).toString())
        : "";

  const name = typeof raw.name === "string" ? raw.name : "";
  const itemSlug = typeof raw.slug === "string" ? raw.slug : "";
  const image = typeof raw.image === "string" ? raw.image : "";
  const price = Number(raw.price ?? 0);

  if (!id || !name || !itemSlug || !image || Number.isNaN(price)) return null;

  return {
    id,
    name,
    slug: itemSlug,
    image,
    price,
    discount:
      raw.discount &&
      typeof raw.discount === "object" &&
      (((raw.discount as { type?: unknown }).type === "percentage") ||
        ((raw.discount as { type?: unknown }).type === "fixed"))
        ? {
            type: (raw.discount as { type: "percentage" | "fixed" }).type,
            value: Number((raw.discount as { value?: unknown }).value ?? 0),
            startAt: (raw.discount as { startAt?: string | Date }).startAt,
            endAt: (raw.discount as { endAt?: string | Date }).endAt,
          }
        : undefined,
    badge: typeof raw.badge === "string" ? raw.badge : undefined,
    category: typeof raw.category === "string" ? raw.category : undefined,
    stock: typeof raw.stock === "number" ? raw.stock : undefined,
  };
}

export default function ProductDetailClient({ slug }: ProductDetailClientProps) {
  const [product, setProduct] = useState<ProductShape | null>(null);
  const [newProducts, setNewProducts] = useState<ProductShape[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewName, setReviewName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [ratingStats, setRatingStats] = useState({ avgRating: 0, reviewCount: 0 });
  const [productConfig, setProductConfig] = useState<ProductDetailConfig>({
    deliveryLocation: "Sindh, Karachi",
    standardDeliveryFee: 140,
    collectionPointFee: 30,
    codLabel: "Available",
    returnPolicy: "14 days easy return",
    warrantyLabel: "12 months",
    sellerName: "VALS Official Store",
    sellerRating: 93,
    shipOnTime: 99,
    responseTime: "Fast",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const normalizedSlug = String(slug || "").trim();

    (async () => {
      try {
        setLoading(true);
        setError(null);
        setProduct(null);
        setNewProducts([]);

        const detailRes = await fetch(`/api/products/${encodeURIComponent(normalizedSlug)}`, {
          signal: controller.signal,
          cache: "force-cache",
        });
        const detailData: unknown = await detailRes.json();

        const detailOk =
          typeof detailData === "object" &&
          detailData !== null &&
          "success" in detailData &&
          (detailData as { success: unknown }).success === true;

        if (!detailRes.ok || !detailOk) {
          throw new Error("Product not found");
        }

        const detailProduct =
          typeof detailData === "object" &&
          detailData !== null &&
          "product" in detailData
            ? normalizeProduct((detailData as { product: unknown }).product)
            : null;

        if (!detailProduct) {
          throw new Error("Invalid product payload");
        }

        const stats =
          typeof detailData === "object" &&
          detailData !== null &&
          "reviewStats" in detailData &&
          typeof (detailData as { reviewStats?: unknown }).reviewStats === "object"
            ? ((detailData as { reviewStats: { avgRating?: number; reviewCount?: number } }).reviewStats ?? {})
            : {};
        setRatingStats({
          avgRating: Number(stats.avgRating ?? 0) || 0,
          reviewCount: Number(stats.reviewCount ?? 0) || 0,
        });

        const config =
          typeof detailData === "object" &&
          detailData !== null &&
          "productDetailConfig" in detailData &&
          typeof (detailData as { productDetailConfig?: unknown }).productDetailConfig === "object"
            ? ((detailData as { productDetailConfig: Partial<ProductDetailConfig> }).productDetailConfig ?? {})
            : {};
        setProductConfig((prev) => ({ ...prev, ...config }));

        setProduct({
          ...detailProduct,
          avgRating: Number(stats.avgRating ?? 0) || 0,
          reviewCount: Number(stats.reviewCount ?? 0) || 0,
        });

        const reviewsRes = await fetch(`/api/products/${encodeURIComponent(normalizedSlug)}/reviews`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const reviewsData: unknown = await reviewsRes.json();
        const reviewsOk =
          typeof reviewsData === "object" &&
          reviewsData !== null &&
          "success" in reviewsData &&
          (reviewsData as { success: unknown }).success === true;
        if (reviewsRes.ok && reviewsOk) {
          const list =
            typeof reviewsData === "object" &&
            reviewsData !== null &&
            "reviews" in reviewsData &&
            Array.isArray((reviewsData as { reviews?: unknown }).reviews)
              ? (reviewsData as { reviews: ProductReview[] }).reviews
              : [];
          setReviews(list);
        }

        // Load related row items in background without blocking detail render.
        const listRes = await fetch("/api/products", {
          signal: controller.signal,
          cache: "force-cache",
        });
        const listData: unknown = await listRes.json();

        const listOk =
          typeof listData === "object" &&
          listData !== null &&
          "success" in listData &&
          (listData as { success: unknown }).success === true;

        if (!listRes.ok || !listOk) return;

        const products =
          typeof listData === "object" &&
          listData !== null &&
          "products" in listData &&
          Array.isArray((listData as { products?: unknown }).products)
            ? (listData as { products: unknown[] }).products
            : [];

        const mapped = products
          .map(normalizeProduct)
          .filter((item): item is ProductShape => item !== null)
          .map((item) => ({
            ...item,
            price: resolveProductPricing({
              price: item.price,
              discount: item.discount,
            }).finalPrice,
          }))
          .filter((item) => item.slug !== detailProduct.slug)
          .slice(0, 12);

        setNewProducts(mapped);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [slug]);

  const pricing = useMemo(
    () =>
      product
        ? resolveProductPricing({
            price: product.price,
            discount: product.discount,
          })
        : null,
    [product]
  );

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    try {
      setReviewSubmitting(true);
      setReviewError(null);
      setReviewSuccess(null);

      const res = await fetch(`/api/products/${encodeURIComponent(product.slug)}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: reviewName.trim(),
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });
      const data: unknown = await res.json();
      const ok =
        typeof data === "object" &&
        data !== null &&
        "success" in data &&
        (data as { success: unknown }).success === true;

      if (!res.ok || !ok) {
        const msg =
          typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof (data as { message?: unknown }).message === "string"
            ? (data as { message: string }).message
            : "Failed to submit review";
        throw new Error(msg);
      }

      const review =
        typeof data === "object" &&
        data !== null &&
        "review" in data &&
        typeof (data as { review?: unknown }).review === "object"
          ? ((data as { review: ProductReview }).review ?? null)
          : null;

      if (review) {
        setReviews((prev) => [review, ...prev]);
        setRatingStats((prev) => {
          const nextCount = prev.reviewCount + 1;
          const nextAvg = ((prev.avgRating * prev.reviewCount) + review.rating) / nextCount;
          return { avgRating: Number(nextAvg.toFixed(1)), reviewCount: nextCount };
        });
      }

      setReviewName("");
      setReviewComment("");
      setReviewRating(5);
      setReviewSuccess("Review submitted successfully.");
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="section-block">
        <div className="container">
          <div className="store-empty">
            <h3>Loading product...</h3>
            <p>Please wait while we load product details.</p>
          </div>
        </div>
      </main>
    );
  }

  if (!product || error) {
    return (
      <main className="section-block">
        <div className="container">
          <p>{error || "Product not found."}</p>
          <Link href="/store" className="btn btn-primary" style={{ marginTop: 16 }}>
            Back to Store
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <div className="container product-back-row">
        <Link href="/store" className="product-back-top">
          <span className="btn-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M15 18l-6-6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to all products
          </span>
        </Link>
      </div>

      <main>
        <section className="section-block">
          <div className="container">
            <div className="product-layout product-market-layout product-market-shell">
              <div className="product-media">
                <input className="product-zoom-toggle" type="checkbox" id={`zoom-${product.slug}`} />
                <label className="product-main-image" htmlFor={`zoom-${product.slug}`}>
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 520px"
                    className="product-main-photo"
                    priority
                    unoptimized
                  />
                </label>
                <label className="product-zoom-overlay" htmlFor={`zoom-${product.slug}`}>
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={1200}
                    height={1200}
                    sizes="(max-width: 1200px) 90vw, 960px"
                    className="product-zoom-image"
                    unoptimized
                  />
                </label>

                <div className="product-thumbs">
                  <div className="product-thumb is-active">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={80}
                      height={80}
                      className="product-thumb-image"
                      unoptimized
                    />
                  </div>
                </div>
              </div>

              <div className="product-info product-panel product-market-main">
                <div className="product-market-head">
                  <h1 className="product-market-title">{product.name}</h1>
                  <p className="product-market-sub">
                    Built for Pakistan operations, fleet-grade reliability, and long-term durability.
                  </p>
                  <div className="product-market-tags">
                    <span>Official Warranty</span>
                    <span>Fast Delivery</span>
                    <span>Trusted Seller</span>
                  </div>
                </div>

                <div className="product-header-row">
                  {product.badge && <span className="product-badge">{product.badge}</span>}
                  <div className="product-rating-row">
                    <span className="product-stars" aria-hidden="true">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <svg key={index} viewBox="0 0 24 24" style={{ opacity: index < Math.round(ratingStats.avgRating || 0) ? 1 : 0.3 }}>
                          <path d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1-4.4-4.3 6.1-.9L12 3Z" fill="currentColor" />
                        </svg>
                      ))}
                    </span>
                    <span className="product-reviews">
                      {ratingStats.reviewCount > 0
                        ? `${ratingStats.avgRating.toFixed(1)} (${ratingStats.reviewCount} review${ratingStats.reviewCount > 1 ? "s" : ""})`
                        : "No reviews yet"}
                    </span>
                  </div>
                </div>

                <div className="product-price-block">
                  {pricing?.hasDiscount && (
                    <div className="product-price-market-row">
                      <p className="product-old-price">
                        Rs {pricing.basePrice.toLocaleString()}
                      </p>
                      <p className="product-discount-pill">
                        -{pricing.discountPercent}%
                      </p>
                    </div>
                  )}
                  <p className="product-price">
                    Rs {Number(pricing?.finalPrice ?? product.price).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="product-price-note">Device price in PKR. Taxes and installation may apply.</p>
                </div>

                {typeof product.stock === "number" && (
                  <div className="product-stock-block">
                    <p className="product-stock">
                      Only <span>{product.stock}</span> item(s) left in stock.
                    </p>
                    <div className="product-stock-bar">
                      <div className="product-stock-bar-fill" />
                    </div>
                    <p className="product-stock-hint">High demand - secure your device today.</p>
                  </div>
                )}

                <BuyNowActions
                  id={product.id}
                  name={product.name}
                  price={pricing?.finalPrice ?? product.price}
                  slug={product.slug}
                  image={product.image}
                  compact
                />

                <details className="product-more-details">
                  <summary>Product details & support</summary>
                  <ul className="product-highlights product-highlights--compact">
                    <li>Original {product.category === "watch" ? "Garmin" : "OEM"} hardware</li>
                    <li>Fully compatible with VALS Tracking platform</li>
                    <li>Includes 12-month standard warranty</li>
                    <li>Local support & installation assistance available</li>
                  </ul>
                  <p className="product-meta-note">53 people are viewing this right now.</p>
                  <div className="product-trust-row">
                    <span className="product-trust-pill">Secure payment</span>
                    <span className="product-trust-pill">Warranty included</span>
                    <span className="product-trust-pill">Local support</span>
                  </div>
                </details>
              </div>

              <aside className="product-side-column">
                <section className="product-side-card">
                  <h3>Delivery Options</h3>
                  <div className="product-side-row"><span>Location</span><strong>{productConfig.deliveryLocation}</strong></div>
                  <div className="product-side-row"><span>Standard Delivery</span><strong>Rs {Number(productConfig.standardDeliveryFee || 0).toLocaleString()}</strong></div>
                  <div className="product-side-row"><span>Collection Point</span><strong>Rs {Number(productConfig.collectionPointFee || 0).toLocaleString()}</strong></div>
                  <div className="product-side-row"><span>Cash on Delivery</span><strong>{productConfig.codLabel}</strong></div>
                </section>

                <section className="product-side-card">
                  <h3>Return & Warranty</h3>
                  <div className="product-side-row"><span>Return</span><strong>{productConfig.returnPolicy}</strong></div>
                  <div className="product-side-row"><span>Warranty</span><strong>{productConfig.warrantyLabel}</strong></div>
                </section>

                <section className="product-side-card">
                  <h3>Sold by</h3>
                  <p className="product-side-seller">{productConfig.sellerName}</p>
                  <div className="product-seller-metrics">
                    <div><span>Seller Rating</span><strong>{Number(productConfig.sellerRating || 0)}%</strong></div>
                    <div><span>Ship On Time</span><strong>{Number(productConfig.shipOnTime || 0)}%</strong></div>
                    <div><span>Response Time</span><strong>{productConfig.responseTime}</strong></div>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </section>

        <section className="section-block" style={{ paddingTop: 0 }}>
          <div className="container">
            <section className="product-review-card">
              <div className="product-review-header">
                <h2>Customer Reviews</h2>
                <p>
                  {ratingStats.reviewCount > 0
                    ? `${ratingStats.avgRating.toFixed(1)} average from ${ratingStats.reviewCount} review${ratingStats.reviewCount > 1 ? "s" : ""}`
                    : "Be the first customer to review this product."}
                </p>
              </div>

              <div className="product-review-grid">
                <form className="product-review-form" onSubmit={submitReview}>
                  <div className="form-field">
                    <label className="form-label" htmlFor="review-name">Your Name</label>
                    <input
                      id="review-name"
                      className="form-input"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="Optional if logged in"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Rating</label>
                    <div className="review-stars-input">
                      {Array.from({ length: 5 }).map((_, index) => {
                        const value = index + 1;
                        return (
                          <button
                            key={value}
                            type="button"
                            className={`review-star-btn${reviewRating >= value ? " is-active" : ""}`}
                            onClick={() => setReviewRating(value)}
                            aria-label={`Rate ${value} star`}
                          >
                            ★
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="review-comment">Comment</label>
                    <textarea
                      id="review-comment"
                      className="form-input"
                      style={{ minHeight: 96, resize: "vertical" }}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                    />
                  </div>
                  {reviewError && <p className="buy-modal-error" style={{ marginBottom: 0 }}>{reviewError}</p>}
                  {reviewSuccess && <p className="buy-modal-success-title" style={{ fontSize: "0.86rem", marginBottom: 0 }}>{reviewSuccess}</p>}
                  <div>
                    <button type="submit" className="btn btn-primary" disabled={reviewSubmitting}>
                      {reviewSubmitting ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </form>

                <div className="product-review-list">
                  {reviews.length === 0 ? (
                    <p className="product-row-empty">No comments yet.</p>
                  ) : (
                    reviews.map((review) => (
                      <article key={review._id} className="product-review-item">
                        <div className="product-review-item-head">
                          <strong>{review.name}</strong>
                          <span>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "-"}</span>
                        </div>
                        <div className="product-review-item-stars">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <span key={index} style={{ opacity: index < review.rating ? 1 : 0.3 }}>★</span>
                          ))}
                        </div>
                        <p>{review.comment}</p>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>

      <ProductDetailRows
        current={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          image: product.image,
          price: pricing?.finalPrice ?? product.price,
        }}
        newProducts={newProducts}
      />
    </>
  );
}
