// app/store/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { getProductBySlug } from "../products";

interface ProductDetailPageProps {
  // params is a Promise in your setup, so type it that way
  params: Promise<{
    slug: string;
  }>;
}

// NOTE: async + await params
export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;          // ← unwrap the Promise
  const product = getProductBySlug(slug); // ← use plain string

  if (!product) {
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
            <Image
              src={product.image}
              alt={product.name}
              width={600}
              height={600}
              className="product-image"
            />
          </div>

          <div className="product-thumbs">
            <div className="product-thumb is-active">
              <Image
                src={product.image}
                alt={product.name}
                width={80}
                height={80}
              />
            </div>
          </div>
        </div>

        {/* RIGHT: info */}
        <div className="product-info">
          {product.badge && (
            <span className="product-badge">{product.badge}</span>
          )}

          <div className="product-rating-row">
            <span className="product-stars">★★★★★</span>
            <span className="product-reviews">(1 customer review)</span>
          </div>

          <p className="product-price">{product.price}</p>

          {typeof product.stock === "number" && (
            <p className="product-stock">
              Only <span>{product.stock}</span> item(s) left in stock.
            </p>
          )}

          <div className="product-actions">
            <div className="product-qty">
              <button type="button">-</button>
              <input type="number" min={1} defaultValue={1} />
              <button type="button">+</button>
            </div>

            <button
              type="button"
              className="btn btn-primary product-add-btn"
            >
              Add to Cart
            </button>

            <button type="button" className="btn product-buy-btn">
              Buy Now
            </button>
          </div>

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

          <div className="product-meta-row">
            <p className="product-meta-note">
              53 people are viewing this right now.
            </p>
            <p className="product-meta-note">
              Guaranteed safe checkout with your trusted payment provider.
            </p>
          </div>

          {/* REMOVE the old back button here */}
        </div>
      </div>
    </div>
  </section>
</main>

    </>
  );
}
