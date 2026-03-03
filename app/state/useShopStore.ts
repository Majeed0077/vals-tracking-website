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

type PersistedShopState = {
  scopeKey?: string;
  cart?: CartItem[];
  wishlist?: WishlistItem[];
  scopedCart?: Record<string, CartItem[]>;
  scopedWishlist?: Record<string, WishlistItem[]>;
};

type ShopState = FilterState & {
  scopeKey: string;
  scopedCart: Record<string, CartItem[]>;
  scopedWishlist: Record<string, WishlistItem[]>;
  cart: CartItem[];
  wishlist: WishlistItem[];
  setScope: (scopeKey: string) => void;
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
      scopeKey: "guest",
      scopedCart: { guest: [] },
      scopedWishlist: { guest: [] },
      cart: [],
      wishlist: [],
      setScope: (scopeKey) => {
        const normalizedScope = String(scopeKey || "guest").trim() || "guest";
        set((state) => ({
          scopeKey: normalizedScope,
          cart: state.scopedCart[normalizedScope] ?? [],
          wishlist: state.scopedWishlist[normalizedScope] ?? [],
        }));
      },
      addToCart: (item, qty = 1) => {
        set((state) => {
          const existing = state.cart.find((c) => c.id === item.id);
          const nextCart = existing
            ? state.cart.map((c) =>
                c.id === item.id ? { ...c, qty: c.qty + qty } : c
              )
            : [...state.cart, { ...item, qty }];
          if (existing) {
            return {
              cart: nextCart,
              scopedCart: {
                ...state.scopedCart,
                [state.scopeKey]: nextCart,
              },
            };
          }
          return {
            cart: nextCart,
            scopedCart: {
              ...state.scopedCart,
              [state.scopeKey]: nextCart,
            },
          };
        });
      },
      updateQty: (id, qty) => {
        const nextQty = Math.max(1, Math.floor(qty));
        set((state) => ({
          cart: state.cart.map((c) => (c.id === id ? { ...c, qty: nextQty } : c)),
          scopedCart: {
            ...state.scopedCart,
            [state.scopeKey]: state.cart.map((c) =>
              c.id === id ? { ...c, qty: nextQty } : c
            ),
          },
        }));
      },
      removeFromCart: (id) => {
        set((state) => {
          const nextCart = state.cart.filter((c) => c.id !== id);
          return {
            cart: nextCart,
            scopedCart: {
              ...state.scopedCart,
              [state.scopeKey]: nextCart,
            },
          };
        });
      },
      clearCart: () => {
        set((state) => ({
          cart: [],
          scopedCart: {
            ...state.scopedCart,
            [state.scopeKey]: [],
          },
        }));
      },
      toggleWishlist: (item) => {
        set((state) => {
          const exists = state.wishlist.some((w) => w.slug === item.slug);
          const nextWishlist = exists
            ? state.wishlist.filter((w) => w.slug !== item.slug)
            : [...state.wishlist, item];
          if (exists) {
            return {
              wishlist: nextWishlist,
              scopedWishlist: {
                ...state.scopedWishlist,
                [state.scopeKey]: nextWishlist,
              },
            };
          }
          return {
            wishlist: nextWishlist,
            scopedWishlist: {
              ...state.scopedWishlist,
              [state.scopeKey]: nextWishlist,
            },
          };
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
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => {
        const state = (persistedState ?? {}) as PersistedShopState;
        const legacyCart = Array.isArray(state.cart) ? state.cart : [];
        const legacyWishlist = Array.isArray(state.wishlist) ? state.wishlist : [];
        const hasScoped =
          state.scopedCart &&
          typeof state.scopedCart === "object" &&
          state.scopedWishlist &&
          typeof state.scopedWishlist === "object";

        if (hasScoped) return state;

        return {
          ...DEFAULT_FILTERS,
          scopeKey: "guest",
          cart: legacyCart,
          wishlist: legacyWishlist,
          scopedCart: { guest: legacyCart },
          scopedWishlist: { guest: legacyWishlist },
        };
      },
      partialize: (state) => ({
        scopeKey: state.scopeKey,
        cart: state.cart,
        wishlist: state.wishlist,
        scopedCart: state.scopedCart,
        scopedWishlist: state.scopedWishlist,
      }),
    }
  )
);
