// app/store/page.tsx
import Image from "next/image";
import Link from "next/link";
import { products } from "./products";

export default function StorePage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Store</h1>
          <p className="page-hero-subtitle">
            Watches, GPS devices and tracking hardware compatible with VALS
            Tracking.
          </p>
        </div>
      </section>

      <main>
        <section className="section-block">
          <div className="container">
            <header className="section-header">
              <h2 className="section-title">Products</h2>
              <p className="section-header-text">
                Select from our most popular GPS trackers, dash cams and smart
                watches.
              </p>
            </header>

            <div className="store-grid">
              {products.map((p) => (
                <article className="store-card" key={p.slug}>
                  {p.badge && <span className="store-badge-top">{p.badge}</span>}

                  <div className="store-image-box">
                    <Image
                      src={p.image}
                      alt={p.name}
                      width={400}
                      height={400}
                      className="store-image"
                    />
                  </div>

                  <h3 className="store-title">{p.name}</h3>
                  <p className="store-price">{p.price}</p>

                  <Link
                    href={`/store/${p.slug}`} // IMPORTANT
                    className="btn btn-primary store-btn"
                  >
                    Order Now
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
