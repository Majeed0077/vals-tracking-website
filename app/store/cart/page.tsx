// app/store/cart/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { useShopStore } from "@/app/state/useShopStore";

export default function CartPage() {
  const cart = useShopStore((state) => state.cart);
  const updateQty = useShopStore((state) => state.updateQty);
  const removeFromCart = useShopStore((state) => state.removeFromCart);
  const clearCart = useShopStore((state) => state.clearCart);

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cart]);

  const formatPrice = (value: number) =>
    Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <main className="section-block">
      <div className="container store-cart-page">
        <div className="store-cart-header">
          <div>
            <h1 className="section-title">Your Cart</h1>
            <p className="section-header-text">
              Review your items before checkout.
            </p>
          </div>
          <Link href="/store" className="btn btn-secondary">
            <span className="btn-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M15 18l-6-6 6-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Continue Shopping
            </span>
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="store-cart-empty">
            <h3>Your cart is empty.</h3>
            <p>Add products from the store to see them here.</p>
            <Link href="/store" className="btn btn-primary">
              <span className="btn-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M6 6h14l-2 8H8L6 6Zm0 0-1-3H2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Browse Store
              </span>
            </Link>
          </div>
        ) : (
          <>
            <div className="store-cart-list">
              {cart.map((item) => (
                <div key={item.id} className="store-cart-row">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={72}
                    height={72}
                    unoptimized
                    className="store-cart-thumb"
                  />
                  <div className="store-cart-info">
                    <div className="store-cart-name">{item.name}</div>
                    <div className="store-cart-price">Rs {formatPrice(item.price)}</div>
                  </div>
                  <div className="store-cart-qty">
                    <label className="form-label" htmlFor={`qty-${item.id}`}>
                      Qty
                    </label>
                    <input
                      id={`qty-${item.id}`}
                      className="form-input"
                      type="number"
                      min={1}
                      value={item.qty}
                      onChange={(e) => updateQty(item.id, Number(e.target.value))}
                    />
                  </div>
                  <div className="store-cart-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <span className="btn-icon">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="M4 7h16M9 7V5h6v2m-8 0 1 12h8l1-12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Remove
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="store-cart-summary">
              <div>
                <p className="admin-stat-label">Total</p>
                <p className="admin-stat-value">Rs {formatPrice(total)}</p>
              </div>
              <div className="store-cart-summary-actions">
                <button type="button" className="btn btn-secondary" onClick={clearCart}>
                  <span className="btn-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M4 7h16M9 7V5h6v2m-8 0 1 12h8l1-12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Clear Cart
                  </span>
                </button>
                <button type="button" className="btn btn-primary">
                  <span className="btn-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M6 12h12m-6-6v12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Checkout (Coming Soon)
                  </span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
