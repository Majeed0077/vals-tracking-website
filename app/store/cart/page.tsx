// app/store/cart/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useShopStore } from "@/app/state/useShopStore";

export default function CartPage() {
  return (
    <Suspense fallback={null}>
      <CartPageContent />
    </Suspense>
  );
}

function CartPageContent() {
  type CheckoutPaymentMethod = "cod" | "easypaisa" | "jazzcash";

  const searchParams = useSearchParams();
  const cart = useShopStore((state) => state.cart);
  const updateQty = useShopStore((state) => state.updateQty);
  const removeFromCart = useShopStore((state) => state.removeFromCart);
  const clearCart = useShopStore((state) => state.clearCart);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    note: "",
    paymentMethod: "cod" as CheckoutPaymentMethod,
    payerPhone: "",
    paymentReference: "",
  });

  useEffect(() => {
    if (searchParams.get("checkout") === "1") {
      setCheckoutOpen(true);
    }
  }, [searchParams]);

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cart]);

  const formatPrice = (value: number) =>
    Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 });

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setCheckoutError(null);
    setOrderSuccess(null);

    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setCheckoutError("Name, phone and address are required.");
      return;
    }
    if (cart.length === 0) {
      setCheckoutError("Your cart is empty.");
      return;
    }
    if (
      form.paymentMethod !== "cod" &&
      (!form.payerPhone.trim() || !form.paymentReference.trim())
    ) {
      setCheckoutError(
        "For Easypaisa/JazzCash, sender phone and transaction reference are required."
      );
      return;
    }

    try {
      setPlacingOrder(true);

      const items = cart.map((item) => ({
        productId: item.id,
        name: item.name,
        qty: item.qty,
        price: item.price,
        image: item.image,
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.name.trim(),
            email: form.email.trim() || undefined,
            phone: form.phone.trim(),
            address: form.address.trim(),
          },
          items,
          status: "pending",
          paymentStatus: "unpaid",
          paymentMethod: form.paymentMethod.toUpperCase(),
          paymentReference:
            form.paymentMethod === "cod"
              ? undefined
              : `${form.paymentReference.trim()} | Sender: ${form.payerPhone.trim()}`,
          shippingCost: 0,
          note: form.note.trim() || undefined,
        }),
      });

      const data: unknown = await res.json();
      const ok =
        typeof data === "object" &&
        data !== null &&
        "success" in data &&
        (data as { success: unknown }).success === true;

      if (!res.ok || !ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof (data as { message?: unknown }).message === "string"
            ? (data as { message: string }).message
            : "Failed to place order.";
        throw new Error(message);
      }

      const orderId =
        typeof data === "object" &&
        data !== null &&
        "order" in data &&
        typeof (data as { order?: { _id?: unknown } }).order?._id === "string"
          ? (data as { order: { _id: string } }).order._id
          : "N/A";

      clearCart();
      setCheckoutOpen(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        note: "",
        paymentMethod: "cod",
        payerPhone: "",
        paymentReference: "",
      });
      setOrderSuccess(`Order placed successfully. Order ID: ${orderId}`);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Failed to place order.");
    } finally {
      setPlacingOrder(false);
    }
  }

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

        {orderSuccess && (
          <div className="admin-success-banner">{orderSuccess}</div>
        )}

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
                <button type="button" className="btn btn-primary" onClick={() => setCheckoutOpen(true)}>
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
                    Checkout
                  </span>
                </button>
              </div>
            </div>

            {checkoutOpen && (
              <section className="admin-form-card" style={{ marginTop: 10 }}>
                <div className="admin-form-header">
                  <div>
                    <h2 className="admin-form-title">Checkout Details</h2>
                    <p className="admin-form-subtitle">Complete your order information.</p>
                  </div>
                </div>
                {checkoutError && <div className="admin-error-banner">{checkoutError}</div>}
                <form onSubmit={handlePlaceOrder}>
                  <div className="admin-form-grid">
                    <div className="form-field">
                      <label className="form-label">Name</label>
                      <input className="form-input" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Email (optional)</label>
                      <input className="form-input" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Phone</label>
                      <input className="form-input" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} required />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Address</label>
                      <input className="form-input" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} required />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Payment Method</label>
                      <select
                        className="form-input"
                        value={form.paymentMethod}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            paymentMethod: e.target.value as CheckoutPaymentMethod,
                          }))
                        }
                      >
                        <option value="cod">Cash on Delivery (COD)</option>
                        <option value="easypaisa">Easypaisa (Manual Confirmation)</option>
                        <option value="jazzcash">JazzCash (Manual Confirmation)</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 13, opacity: 0.82 }}>
                    {form.paymentMethod === "cod"
                      ? "COD selected: payment will be collected at delivery."
                      : "Manual payment selected: enter sender phone and transaction/reference ID. Admin will verify payment manually."}
                  </div>
                  {form.paymentMethod !== "cod" && (
                    <div className="admin-form-grid" style={{ marginTop: 8 }}>
                      <div className="form-field">
                        <label className="form-label">Sender Phone (Payment Account)</label>
                        <input
                          className="form-input"
                          value={form.payerPhone}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, payerPhone: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Transaction Reference / Trx ID</label>
                        <input
                          className="form-input"
                          value={form.paymentReference}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              paymentReference: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                    </div>
                  )}
                  <div className="form-field" style={{ marginTop: 8 }}>
                    <label className="form-label">Note (optional)</label>
                    <textarea className="form-input" value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} />
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setCheckoutOpen(false)} disabled={placingOrder}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={placingOrder}>
                      {placingOrder ? "Placing Order..." : "Place Order"}
                    </button>
                  </div>
                </form>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
