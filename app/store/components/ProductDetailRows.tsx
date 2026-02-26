"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

type RowProduct = {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
};

type ProductDetailRowsProps = {
  current: RowProduct;
  newProducts: RowProduct[];
};

const RECENT_KEY = "vals_recent_products";

export default function ProductDetailRows({ current, newProducts }: ProductDetailRowsProps) {
  const recent = useMemo(() => {
    if (typeof window === "undefined") return [] as RowProduct[];

    const raw = window.localStorage.getItem(RECENT_KEY);
    let list: RowProduct[] = [];

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          list = parsed.filter((item): item is RowProduct => {
            return (
              typeof item === "object" &&
              item !== null &&
              typeof (item as { id?: unknown }).id === "string" &&
              typeof (item as { slug?: unknown }).slug === "string" &&
              typeof (item as { name?: unknown }).name === "string" &&
              typeof (item as { image?: unknown }).image === "string" &&
              typeof (item as { price?: unknown }).price === "number"
            );
          });
        }
      } catch {
        list = [];
      }
    }

    const withoutCurrent = list.filter((item) => item.slug !== current.slug);
    const next = [current, ...withoutCurrent].slice(0, 12);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    return next.filter((item) => item.slug !== current.slug).slice(0, 8);
  }, [current]);

  const compactNew = useMemo(() => newProducts.filter((item) => item.slug !== current.slug).slice(0, 8), [newProducts, current.slug]);

  return (
    <section className="product-detail-rows section-block">
      <div className="container">
        <ProductRow title="Recent Visit" products={recent} emptyText="No recent items yet." />
        <ProductRow title="New Products" products={compactNew} emptyText="No new products available." />
      </div>
    </section>
  );
}

function ProductRow({
  title,
  products,
  emptyText,
}: {
  title: string;
  products: RowProduct[];
  emptyText: string;
}) {
  return (
    <div className="product-row-block">
      <div className="product-row-head">
        <h2>{title}</h2>
      </div>
      {products.length === 0 ? (
        <p className="product-row-empty">{emptyText}</p>
      ) : (
        <div className="product-row-scroll">
          {products.map((item) => (
            <Link key={`${title}-${item.id}`} href={`/store/${item.slug}`} className="product-row-card">
              <div className="product-row-image-wrap">
                <Image src={item.image} alt={item.name} width={120} height={120} unoptimized className="product-row-image" />
              </div>
              <p className="product-row-name">{item.name}</p>
              <p className="product-row-price">Rs {item.price.toLocaleString()}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
