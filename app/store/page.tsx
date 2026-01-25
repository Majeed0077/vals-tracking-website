import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import StoreClient from "@/app/store/StoreClient";
import type { StoreProduct } from "@/app/store/types";

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

  return <StoreClient products={products} />;
}
