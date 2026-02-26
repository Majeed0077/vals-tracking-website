import StoreClient from "@/app/store/StoreClient";

export const revalidate = 120;

export default function StorePage() {
  // Instant route shell: catalog hydrates client-side so page opens immediately.
  return <StoreClient products={[]} />;
}
