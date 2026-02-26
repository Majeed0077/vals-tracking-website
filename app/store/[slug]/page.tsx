// app/store/[slug]/page.tsx
import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Image from "next/image";
import BuyNowActions from "@/app/components/BuyNowActions";
import ProductDetailRows from "@/app/store/components/ProductDetailRows";

export const dynamic = "force-dynamic";

type ProductDoc = {
  _id: { toString(): string };
  name: string;
  slug: string;
  image: string;
  price: number;
  badge?: string;
  category?: string;
  stock?: number;
};

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug: raw } = await params;

  await connectDB();

  // ✅ decode + normalize slug from URL
  const decodedSlug = decodeURIComponent(String(raw))
    .trim()
    .toLowerCase();

  // ✅ try normalized exact match first (for new clean slugs like "basic-plan")
  let doc = (await Product.findOne({ slug: decodedSlug }).lean()) as ProductDoc | null;

  // ✅ fallback for old DB slugs like "Basic plan" (case-insensitive exact)
  if (!doc) {
    const rawDecoded = decodeURIComponent(String(raw)).trim();
    doc = (await Product.findOne({
      slug: { $regex: `^${escapeRegex(rawDecoded)}$`, $options: "i" },
    }).lean()) as ProductDoc | null;
  }

  if (!doc) {
    return (
      <main className="section-block">
        <div className="container">
          <p>Product not found.</p>
          <Link href="/store" className="btn btn-primary" style={{ marginTop: 16 }}>
            Back to Store
          </Link>
        </div>
      </main>
    );
  }

  const product = {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    image: doc.image,
    price: doc.price,
    badge: doc.badge,
    category: doc.category,
    stock: doc.stock,
  };

  const latestDocs = (await Product.find({ slug: { $ne: product.slug } })
    .sort({ createdAt: -1 })
    .limit(12)
    .lean()) as ProductDoc[];

  const newProducts = latestDocs.map((item) => ({
    id: item._id.toString(),
    slug: item.slug,
    name: item.name,
    image: item.image,
    price: item.price,
  }));

  const pseudoDiscount = Math.max(8, Math.min(48, 14 + (product.slug.length % 34)));
  const oldPrice = Math.round(product.price / (1 - pseudoDiscount / 100));

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
              {/* LEFT: image */}
              <div className="product-media">
                {/* MAIN IMAGE */}
                <input
                  className="product-zoom-toggle"
                  type="checkbox"
                  id={`zoom-${product.slug}`}
                />
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

                {/* THUMBNAIL */}
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
              {/* CENTER: advanced info panel */}
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

                {/* top row: badge + rating */}
                <div className="product-header-row">
                  {product.badge && (
                    <span className="product-badge">{product.badge}</span>
                  )}

                  <div className="product-rating-row">
                                        <span className="product-stars" aria-hidden="true">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <svg key={index} viewBox="0 0 24 24">
                          <path
                            d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1-4.4-4.3 6.1-.9L12 3Z"
                            fill="currentColor"
                          />
                        </svg>
                      ))}
                    </span>
                    <span className="product-reviews">(1 customer review)</span>
                  </div>
                </div>

                {/* price + small note */}
                <div className="product-price-block">
                  <div className="product-price-market-row">
                    <p className="product-old-price">Rs {oldPrice.toLocaleString()}</p>
                    <p className="product-discount-pill">-{pseudoDiscount}%</p>
                  </div>
                  <p className="product-price">
                    Rs{" "}
                    {Number(product.price).toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                  <p className="product-price-note">
                    Device price in PKR. Taxes and installation may apply.
                  </p>
                </div>

                {/* stock info with progress bar */}
                {typeof product.stock === "number" && (
                  <div className="product-stock-block">
                    <p className="product-stock">
                      Only <span>{product.stock}</span> item(s) left in stock.
                    </p>
                    <div className="product-stock-bar">
                      <div className="product-stock-bar-fill" />
                    </div>
                    <p className="product-stock-hint">
                      High demand - secure your device today.
                    </p>
                  </div>
                )}

                <BuyNowActions
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  slug={product.slug}
                  image={product.image}
                  compact
                />

                <details className="product-more-details">
                  <summary>Product details & support</summary>
                  <ul className="product-highlights product-highlights--compact">
                    <li>
                      Original {product.category === "watch" ? "Garmin" : "OEM"} hardware
                    </li>
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

              {/* RIGHT: delivery/seller cards */}
              <aside className="product-side-column">
                <section className="product-side-card">
                  <h3>Delivery Options</h3>
                  <div className="product-side-row">
                    <span>Location</span>
                    <strong>Sindh, Karachi</strong>
                  </div>
                  <div className="product-side-row">
                    <span>Standard Delivery</span>
                    <strong>Rs 140</strong>
                  </div>
                  <div className="product-side-row">
                    <span>Collection Point</span>
                    <strong>Rs 30</strong>
                  </div>
                  <div className="product-side-row">
                    <span>Cash on Delivery</span>
                    <strong>Available</strong>
                  </div>
                </section>

                <section className="product-side-card">
                  <h3>Return & Warranty</h3>
                  <div className="product-side-row">
                    <span>Return</span>
                    <strong>14 days easy return</strong>
                  </div>
                  <div className="product-side-row">
                    <span>Warranty</span>
                    <strong>12 months</strong>
                  </div>
                </section>

                <section className="product-side-card">
                  <h3>Sold by</h3>
                  <p className="product-side-seller">VALS Official Store</p>
                  <div className="product-seller-metrics">
                    <div>
                      <span>Seller Rating</span>
                      <strong>93%</strong>
                    </div>
                    <div>
                      <span>Ship On Time</span>
                      <strong>99%</strong>
                    </div>
                    <div>
                      <span>Response Time</span>
                      <strong>Fast</strong>
                    </div>
                  </div>
                </section>

                <section className="product-side-card">
                  <h3>Buyer Confidence</h3>
                  <div className="product-side-row">
                    <span>People viewing now</span>
                    <strong>53</strong>
                  </div>
                  <div className="product-side-row">
                    <span>Secure checkout</span>
                    <strong>Enabled</strong>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <ProductDetailRows
        current={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          image: product.image,
          price: product.price,
        }}
        newProducts={newProducts}
      />
    </>
  );
}
