// app/state/useShopStore.ts
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  qty: number;
};

export type WishlistItem = {
  slug: string;
  name: string;
  price: number;
  image: string;
};

export type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

export type FilterState = {
  category: "all" | "tracker" | "dashcam" | "watch";
  search: string;
  sort: SortOption;
  page: number;
  perPage: number;
};

type ShopState = FilterState & {
  cart: CartItem[];
  wishlist: WishlistItem[];
  addToCart: (item: Omit<CartItem, "qty">, qty?: number) => void;
  updateQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (slug: string) => boolean;
  setCategory: (category: FilterState["category"]) => void;
  setSearch: (search: string) => void;
  setSort: (sort: SortOption) => void;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  resetFilters: () => void;
};

const DEFAULT_FILTERS: FilterState = {
  category: "all",
  search: "",
  sort: "newest",
  page: 1,
  perPage: 9,
};

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_FILTERS,
      cart: [],
      wishlist: [],
      addToCart: (item, qty = 1) => {
        set((state) => {
          const existing = state.cart.find((c) => c.id === item.id);
          if (existing) {
            return {
              cart: state.cart.map((c) =>
                c.id === item.id ? { ...c, qty: c.qty + qty } : c
              ),
            };
          }
          return { cart: [...state.cart, { ...item, qty }] };
        });
      },
      updateQty: (id, qty) => {
        const nextQty = Math.max(1, Math.floor(qty));
        set((state) => ({
          cart: state.cart.map((c) => (c.id === id ? { ...c, qty: nextQty } : c)),
        }));
      },
      removeFromCart: (id) => {
        set((state) => ({ cart: state.cart.filter((c) => c.id !== id) }));
      },
      clearCart: () => {
        set({ cart: [] });
      },
      toggleWishlist: (item) => {
        set((state) => {
          const exists = state.wishlist.some((w) => w.slug === item.slug);
          if (exists) {
            return { wishlist: state.wishlist.filter((w) => w.slug !== item.slug) };
          }
          return { wishlist: [...state.wishlist, item] };
        });
      },
      isInWishlist: (slug) => {
        return get().wishlist.some((w) => w.slug === slug);
      },
      setCategory: (category) => {
        set({ category, page: 1 });
      },
      setSearch: (search) => {
        set({ search, page: 1 });
      },
      setSort: (sort) => {
        set({ sort, page: 1 });
      },
      setPage: (page) => {
        set({ page });
      },
      setPerPage: (perPage) => {
        set({ perPage, page: 1 });
      },
      resetFilters: () => {
        set({ ...DEFAULT_FILTERS });
      },
    }),
    {
      name: "vals-shop-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
      }),
    }
  )
);
