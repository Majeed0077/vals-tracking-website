// app/store/[slug]/page.tsx
import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Image from "next/image";
import BuyNowActions from "@/app/components/BuyNowActions";

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

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">{product.name}</h1>
          <p className="page-hero-subtitle">
            Detailed information for {product.name}.
          </p>
        </div>
      </section>

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
            <div className="product-layout">
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
              {/* RIGHT: advanced info panel */}
              <div className="product-info product-panel">
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

                {/* key highlights */}
                <ul className="product-highlights">
                  <li>
                    Original {product.category === "watch" ? "Garmin" : "OEM"}{" "}
                    hardware
                  </li>
                  <li>Fully compatible with VALS Tracking platform</li>
                  <li>Includes 12-month standard warranty</li>
                  <li>Local support &amp; installation assistance available</li>
                </ul>

                <BuyNowActions
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  slug={product.slug}
                  image={product.image}
                />

                {/* trust + meta */}
                <div className="product-meta-row">
                  <p className="product-meta-note">
                    53 people are viewing this right now.
                  </p>
                  <p className="product-meta-note">
                    Guaranteed safe checkout with your trusted payment provider.
                  </p>

                  <div className="product-trust-row">
                    <span className="product-trust-pill">Secure payment</span>
                    <span className="product-trust-pill">Warranty included</span>
                    <span className="product-trust-pill">Local support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
