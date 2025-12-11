// app/store/[slug]/page.tsx
import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

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

// IMPORTANT: params is a Promise in your setup
type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  // ⬅️ yahan Promise ko unwrap kar rahe hain
  const { slug } = await params;

  await connectDB();

  const doc = (await Product.findOne({ slug }).lean()) as ProductDoc | null;

  if (!doc) {
    return (
      <main className="section-block">
        <div className="container">
          <p>Product not found.</p>
          <Link
            href="/store"
            className="btn btn-primary"
            style={{ marginTop: 16 }}
          >
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

      {/* BACK BUTTON RIGHT UNDER HERO */}
      <div className="container" style={{ marginTop: "10px" }}>
        <Link href="/store" className="product-back-top">
          ← Back to all products
        </Link>
      </div>

      <main>
        <section className="section-block">
          <div className="container">
            <div className="product-layout">
              {/* LEFT: image */}
              <div className="product-media">
                <div className="product-main-image">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                    style={{
                      width: "100%",
                      maxWidth: 520,
                      borderRadius: 16,
                      objectFit: "cover",
                    }}
                  />
                </div>

                <div className="product-thumbs">
                  <div className="product-thumb is-active">
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 12,
                      }}
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
                    <span className="product-stars">★★★★★</span>
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
                      High demand – secure your device today.
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

                {/* Quantity + primary actions */}
                <div className="product-actions">
                  <div className="product-qty">
                    <button type="button" aria-label="Decrease quantity">
                      -
                    </button>
                    <input type="number" min={1} defaultValue={1} />
                    <button type="button" aria-label="Increase quantity">
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary product-add-btn"
                  >
                    Add to Cart
                  </button>

                  <button
                    type="button"
                    className="btn product-buy-btn product-buy-primary"
                  >
                    Buy Now
                  </button>
                </div>

                {/* secondary quick links */}
                <div className="product-links-row">
                  <button type="button" className="product-link-btn">
                    Size Guide
                  </button>
                  <button type="button" className="product-link-btn">
                    Delivery &amp; Return
                  </button>
                  <button type="button" className="product-link-btn">
                    Ask a Question
                  </button>
                </div>

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
