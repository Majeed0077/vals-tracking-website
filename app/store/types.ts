// app/store/types.ts

export type StoreProduct = {
  _id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  discount?: {
    type: "percentage" | "fixed";
    value: number;
    startAt?: string | Date;
    endAt?: string | Date;
  };
  badge?: string;
  category?: string;
};
