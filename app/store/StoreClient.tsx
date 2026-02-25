// app/store/StoreClient.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useShopStore } from "@/app/state/useShopStore";
import type { StoreProduct } from "@/app/store/types";

type StoreClientProps = {
  products: StoreProduct[];
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

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const applySearch = useCallback(
    (value: string) => {
      setSearch(value);
      setPage(1);
    },
    [setPage, setSearch]
  );

  const filteredProducts = useMemo(() => {
    const normalized = searchInput.trim().toLowerCase();
    let list = products;

    if (category !== "all") {
      list = list.filter((p) => p.category === category);
    }

    if (normalized) {
      list = list.filter((p) => p.name.toLowerCase().includes(normalized));
    }

    const sorted = [...list];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
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
  }, [products, category, searchInput, sort]);

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

            <div className="store-toolbar">
              <div className="store-toolbar-row">
                <div className="store-toolbar-title">
                  <h2 className="store-title-heading">Products</h2>
                  <p className="store-title-sub">
                    Select from our most popular GPS trackers, dash cams and smart watches.
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
              {filteredProducts.length === 0 ? (
                <div className="store-empty">
                  <h3>No products match your filters.</h3>
                  <p>Try clearing filters or searching with a different keyword.</p>
                </div>
              ) : (
                <>
                  <div className="store-grid">
                    {pagedProducts.map((p) => {
                      const inWishlist = wishlist.some((w) => w.slug === p.slug);
                      const inCart = cart.some((item) => item.slug === p.slug);
                      return (
                        <article className="store-card" key={p._id}>
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
                            <p className="store-price">Rs {formatPrice(p.price)}</p>

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
                                    price: p.price,
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
                                price: p.price,
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
