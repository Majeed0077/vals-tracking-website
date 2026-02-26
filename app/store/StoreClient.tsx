// app/store/StoreClient.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useShopStore } from "@/app/state/useShopStore";
import type { StoreProduct } from "@/app/store/types";
import { resolveProductPricing } from "@/lib/productPricing";

type StoreClientProps = {
  products: StoreProduct[];
};

type ApiProduct = {
  _id: string | { toString(): string };
  name?: string;
  slug?: string;
  image?: string;
  price?: number;
  discount?: {
    type?: "percentage" | "fixed";
    value?: number;
    startAt?: string | Date;
    endAt?: string | Date;
  };
  badge?: string;
  category?: string;
};

const CATEGORY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Tracker", value: "tracker" },
  { label: "Dashcam", value: "dashcam" },
  { label: "Watch", value: "watch" },
] as const;

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A-Z", value: "name-asc" },
  { label: "Name: Z-A", value: "name-desc" },
] as const;

function getProductMeta(product: StoreProduct) {
  const seed = product.slug
    .split("")
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const rating = 3.8 + ((seed % 12) / 10); // 3.8 - 4.9
  const ratingCount = 10 + (seed % 320);
  return {
    rating: Math.min(5, Number(rating.toFixed(1))),
    ratingCount,
  };
}

function normalizeApiProduct(value: unknown): StoreProduct | null {
  if (!value || typeof value !== "object") return null;
  const obj = value as ApiProduct;

  const idValue = obj._id;
  const id =
    typeof idValue === "string"
      ? idValue
      : idValue && typeof idValue === "object" && "toString" in idValue
        ? idValue.toString()
        : "";

  const name = typeof obj.name === "string" ? obj.name.trim() : "";
  const slug = typeof obj.slug === "string" ? obj.slug.trim() : "";
  const image = typeof obj.image === "string" ? obj.image : "";
  const price = Number(obj.price ?? 0);

  if (!id || !name || !slug || !image || Number.isNaN(price)) return null;

  return {
    _id: id,
    name,
    slug,
    image,
    price,
    discount:
      obj.discount &&
      typeof obj.discount === "object" &&
      (((obj.discount as { type?: unknown }).type === "percentage") ||
        ((obj.discount as { type?: unknown }).type === "fixed"))
        ? {
            type: (obj.discount as { type: "percentage" | "fixed" }).type,
            value: Number((obj.discount as { value?: unknown }).value ?? 0),
            startAt: (obj.discount as { startAt?: string | Date }).startAt,
            endAt: (obj.discount as { endAt?: string | Date }).endAt,
          }
        : undefined,
    badge: typeof obj.badge === "string" ? obj.badge : undefined,
    category: typeof obj.category === "string" ? obj.category : undefined,
  };
}

export default function StoreClient({ products }: StoreClientProps) {
  const {
    category,
    search,
    sort,
    page,
    perPage,
    cart,
    wishlist,
    addToCart,
    removeFromCart,
    toggleWishlist,
    setCategory,
    setSearch,
    setSort,
    setPage,
    setPerPage,
  } = useShopStore((state) => state);

  const [searchInput, setSearchInput] = useState(search);
  const [catalog, setCatalog] = useState<StoreProduct[]>(products);
  const [catalogLoading, setCatalogLoading] = useState(products.length === 0);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    if (products.length > 0) {
      setCatalog(products);
      setCatalogLoading(false);
      setCatalogError(null);
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        setCatalogLoading(true);
        setCatalogError(null);

        const res = await fetch("/api/products", {
          cache: "force-cache",
          signal: controller.signal,
        });

        const data: unknown = await res.json();
        const ok =
          typeof data === "object" &&
          data !== null &&
          "success" in data &&
          (data as { success: unknown }).success === true;

        if (!res.ok || !ok) {
          throw new Error("Failed to load catalog");
        }

        const list =
          typeof data === "object" &&
          data !== null &&
          "products" in data &&
          Array.isArray((data as { products?: unknown }).products)
            ? (data as { products: unknown[] }).products
            : [];

        const normalized = list
          .map(normalizeApiProduct)
          .filter((item): item is StoreProduct => item !== null);

        setCatalog(normalized);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Store catalog load failed:", error);
        setCatalog([]);
        setCatalogError("Catalog is loading slowly. Please wait a moment.");
      } finally {
        if (!controller.signal.aborted) {
          setCatalogLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [products]);

  const applySearch = useCallback(
    (value: string) => {
      setSearch(value);
      setPage(1);
    },
    [setPage, setSearch]
  );

  const filteredProducts = useMemo(() => {
    const normalized = searchInput.trim().toLowerCase();
    let list = catalog;

    if (category !== "all") {
      list = list.filter((p) => p.category === category);
    }

    if (normalized) {
      list = list.filter((p) => p.name.toLowerCase().includes(normalized));
    }

    const sorted = [...list];
    switch (sort) {
      case "price-asc":
        sorted.sort(
          (a, b) =>
            resolveProductPricing({ price: a.price, discount: a.discount }).finalPrice -
            resolveProductPricing({ price: b.price, discount: b.discount }).finalPrice
        );
        break;
      case "price-desc":
        sorted.sort(
          (a, b) =>
            resolveProductPricing({ price: b.price, discount: b.discount }).finalPrice -
            resolveProductPricing({ price: a.price, discount: a.discount }).finalPrice
        );
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    return sorted;
  }, [catalog, category, searchInput, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / perPage));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages, setPage]);

  const pagedProducts = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredProducts.slice(start, start + perPage);
  }, [filteredProducts, page, perPage]);

  const formatPrice = (value: number) =>
    Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <>
      {/* <section className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Store</h1>
          <p className="page-hero-subtitle">
            Watches, GPS devices and tracking hardware compatible with VALS Tracking.
          </p>
        </div>
      </section> */}

      <main>
        <section className="section-block">
          <div className="container store-container">

            <div className="store-toolbar store-toolbar-market">
              <div className="store-toolbar-row">
                <div className="store-toolbar-title">
                  <h2 className="store-title-heading">Shop All</h2>
                  <p className="store-title-sub">
                    Handpicked devices and accessories with trusted local support.
                  </p>
                </div>

                <div className="store-toolbar-controls">
                  <div className="store-search">
                    <span className="store-search-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path
                          d="M10.5 4a6.5 6.5 0 1 1 4.08 11.55l4.44 4.44-1.5 1.5-4.44-4.44A6.5 6.5 0 0 1 10.5 4Z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <input
                      className="store-search-input"
                      placeholder="Search products"
                      value={searchInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSearchInput(value);
                        applySearch(value.trim());
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          applySearch(searchInput.trim());
                        }
                      }}
                    />
                  </div>

                  <select
                    className="store-select"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as (typeof SORT_OPTIONS)[number]["value"])}
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <select
                    className="store-select"
                    value={perPage}
                    onChange={(e) => setPerPage(Number(e.target.value))}
                  >
                    <option value={6}>6 / page</option>
                    <option value={9}>9 / page</option>
                    <option value={12}>12 / page</option>
                  </select>
                </div>
              </div>

              <div className="store-filter-group">
                {CATEGORY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`store-filter-chip${
                      category === option.value ? " is-active" : ""
                    }`}
                    onClick={() => setCategory(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="store-content">
              {catalogLoading ? (
                <div className="store-grid store-grid-skeleton" aria-live="polite">
                  {Array.from({ length: Math.max(6, perPage) }).map((_, index) => (
                    <article key={index} className="store-skeleton-card">
                      <div className="store-skeleton-image" />
                      <div className="store-skeleton-line store-skeleton-line--title" />
                      <div className="store-skeleton-line" />
                      <div className="store-skeleton-line store-skeleton-line--short" />
                    </article>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="store-empty">
                  <h3>No products match your filters.</h3>
                  <p>
                    {catalogError ||
                      "Try clearing filters or searching with a different keyword."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="store-grid">
                    {pagedProducts.map((p) => {
                      const inWishlist = wishlist.some((w) => w.slug === p.slug);
                      const inCart = cart.some((item) => item.slug === p.slug);
                      return (
                        <article className="store-card store-card-market" key={p._id}>
                          {p.badge && <span className="store-badge-top">{p.badge}</span>}

                          <div className="store-image-box">
                            <Image
                              src={p.image}
                              alt={p.name}
                              className="store-image"
                              width={320}
                              height={320}
                              unoptimized
                            />
                          </div>

                            {p.category && <span className="store-category">{p.category}</span>}
                            <h3 className="store-title">{p.name}</h3>
                            <StorePriceAndRating product={p} formatPrice={formatPrice} />

                        <div className="store-card-actions">
                          <button
                            type="button"
                            className="btn btn-secondary store-btn"
                            onClick={() =>
                              inCart
                                ? removeFromCart(p.slug)
                                : addToCart({
                                    id: p.slug,
                                    slug: p.slug,
                                    name: p.name,
                                    price: resolveProductPricing({
                                      price: p.price,
                                      discount: p.discount,
                                    }).finalPrice,
                                    image: p.image,
                                  })
                            }
                          >
                            <span className="btn-icon">
                              <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                  d="M6 6h14l-2 8H8L6 6Zm0 0-1-3H2m6 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              {inCart ? "Remove from Cart" : "Add to Cart"}
                            </span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary store-btn"
                            onClick={() =>
                              toggleWishlist({
                                slug: p.slug,
                                name: p.name,
                                price: resolveProductPricing({
                                  price: p.price,
                                  discount: p.discount,
                                }).finalPrice,
                                image: p.image,
                              })
                            }
                          >
                            <span className="btn-icon">
                              <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                  d="M12 20s-6-4.35-8.5-7.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8.5 6.5C18 15.65 12 20 12 20Z"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              {inWishlist ? "Remove Wishlist" : "Save Wishlist"}
                            </span>
                          </button>
                        </div>

                            <Link href={`/store/${p.slug}`} className="btn btn-primary store-btn store-btn-primary">
                              View Details
                            </Link>
                          </article>
                        );
                      })}
                    </div>

                    <div className="store-pagination">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page <= 1}
                      >
                        Prev
                      </button>
                      <span>
                        Page {page} of {totalPages}
                      </span>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page >= totalPages}
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
        </section>
      </main>
    </>
  );
}

function StorePriceAndRating({
  product,
  formatPrice,
}: {
  product: StoreProduct;
  formatPrice: (value: number) => string;
}) {
  const meta = getProductMeta(product);
  const pricing = resolveProductPricing({
    price: product.price,
    discount: product.discount,
  });

  return (
    <div className="store-market-meta">
      <p className="store-price">
        Rs {formatPrice(pricing.finalPrice)}
        {pricing.hasDiscount && (
          <>
            <span className="store-old-price">Rs {formatPrice(pricing.basePrice)}</span>
            <span className="store-discount">-{pricing.discountPercent}%</span>
          </>
        )}
      </p>
      <p className="store-rating-line">
        <span className="store-rating-stars">{"★".repeat(5)}</span>
        <span className="store-rating-count">({meta.ratingCount})</span>
      </p>
    </div>
  );
}
