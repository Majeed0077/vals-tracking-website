// app/store/products.ts

export type ProductCategory = "tracker" | "dashcam" | "watch";

export type StoreProduct = {
  slug: string;
  name: string;
  price: string;
  image: string;
  category: ProductCategory;
  badge?: string;
  stock?: number;
};

export const products: StoreProduct[] = [
  {
    slug: "etrex-10",
    name: "eTrex® 10",
    price: "Rs 47,760.00",
    image: "/images/products/etrex.png",
    category: "tracker",
    badge: "Featured",
    stock: 24,
  },
  {
    slug: "delta-smart-dog-training",
    name: "Delta Smart Dog Training System",
    price: "Rs 134,840.00",
    image: "/images/products/delta-smart.png",
    category: "tracker",
    badge: "Featured",
    stock: 12,
  },
  {
    slug: "garmin-dash-cam-tandem",
    name: "Garmin Dash Cam™ Tandem",
    price: "Rs 104,080.00",
    image: "/images/products/dashcam-tandem.png",
    category: "dashcam",
    badge: "Featured",
    stock: 18,
  },
  {
    slug: "tread-sxs-edition",
    name: "Tread® — SxS Edition",
    price: "Rs 463,600.00",
    image: "/images/products/tread-5.png",
    category: "tracker",
    badge: "Featured",
    stock: 38,
  },
  {
    slug: "instinct-2-solar-tactical",
    name: "Instinct® 2 Solar – Tactical Edition",
    price: "Rs 178,500.00",
    image: "/images/products/instinct-2-solar.png",
    category: "watch",
    badge: "New",
    stock: 10,
  },
  {
    slug: "vivosmart-5",
    name: "Vivosmart® 5",
    price: "Rs 57,760.00",
    image: "/images/products/vivosmart-5.png",
    category: "watch",
    stock: 40,
  },
  {
    slug: "forerunner-945",
    name: "Forerunner® 945",
    price: "Rs 137,600.00",
    image: "/images/products/forerunner-945.png",
    category: "watch",
    badge: "Popular",
    stock: 15,
  },
  {
    slug: "epix-pro-gen2-sapphire",
    name: "epix™ Pro (Gen 2) – Sapphire Edition",
    price: "Rs 275,000.00",
    image: "/images/products/epix-pro.png",
    category: "watch",
    badge: "Premium",
    stock: 5,
  },
];

// simple version first – exact match on slug
export function getProductBySlug(slug: string): StoreProduct | undefined {
  return products.find((p) => p.slug === slug);
}
