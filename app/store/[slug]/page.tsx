import ProductDetailClient from "@/app/store/ProductDetailClient";

export const revalidate = 120;

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  return <ProductDetailClient slug={decodeURIComponent(String(slug))} />;
}
