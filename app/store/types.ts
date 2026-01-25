// app/store/types.ts

export type StoreProduct = {
  _id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  badge?: string;
  category?: string;
};
