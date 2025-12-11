import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

// Type of DB document returned by .lean()
type ProductDoc = {
  _id: string | { toString(): string };
  name: string;
  slug: string;
  image: string;
  price: number;
  badge?: string;
  category?: string;
};


type StoreProduct = {
  _id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  badge?: string;
  category?: string;
};

export default async function StorePage() {
  await connectDB();

  // docs will be ProductDoc[]
  const docs = (await Product.find().sort({ createdAt: -1 }).lean()) as ProductDoc[];

  const products: StoreProduct[] = docs.map((doc) => ({
    _id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    image: doc.image,
    price: doc.price,
    badge: doc.badge,
    category: doc.category,
  }));

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Store</h1>
          <p className="page-hero-subtitle">
            Watches, GPS devices and tracking hardware compatible with VALS Tracking.
          </p>
        </div>
      </section>

      <main>
        <section className="section-block">
          <div className="container">
            <header className="section-header">
              <h2 className="section-title">Products</h2>
              <p className="section-header-text">
                Select from our most popular GPS trackers, dash cams and smart watches.
              </p>
            </header>

            <div className="store-grid">
              {products.map((p) => (
                <article className="store-card" key={p._id}>
                  {p.badge && <span className="store-badge-top">{p.badge}</span>}

                  <div className="store-image-box">
                    <img src={p.image} alt={p.name} className="store-image" />
                  </div>

                  <h3 className="store-title">{p.name}</h3>
                  <p className="store-price">
                    Rs {Number(p.price).toLocaleString()}
                  </p>

                  <Link href={`/store/${p.slug}`} className="btn btn-primary store-btn">
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
