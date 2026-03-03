"use client";

import { useMemo, useState } from "react";
import QtySelector from "@/app/components/QtySelector";
import { useShopStore } from "@/app/state/useShopStore";

type BuyNowActionsProps = {
  id: string;
  name: string;
  price: number;
  slug: string;
  image: string;
  compact?: boolean;
};

export default function BuyNowActions({
  id,
  name,
  price,
  slug,
  image,
  compact = false,
}: BuyNowActionsProps) {
  const addToCart = useShopStore((state) => state.addToCart);
  const removeFromCart = useShopStore((state) => state.removeFromCart);
  const toggleWishlist = useShopStore((state) => state.toggleWishlist);
  const wishlist = useShopStore((state) => state.wishlist);
  const cart = useShopStore((state) => state.cart);
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState<"buy" | "whatsapp" | "quick" | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [orderRef, setOrderRef] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    paymentMethod: "cod",
    address: "",
    note: "",
  });
  const inWishlist = useMemo(() => {
    return wishlist.some((item) => item.slug === slug);
  }, [wishlist, slug]);

  const inCart = useMemo(() => {
    return cart.some((item) => item.slug === slug);
  }, [cart, slug]);

  const waLink = useMemo(() => {
    const base = "https://wa.me/923111101066";
    const message = `Order Request:%0AProduct: ${encodeURIComponent(
      name
    )}%0ASlug: ${encodeURIComponent(slug)}%0AQty: ${qty}%0APrice: Rs ${price}`;
    return `${base}?text=${message}`;
  }, [name, price, qty, slug]);

  const waMessage = useMemo(
    () => decodeURIComponent(waLink.replace("https://wa.me/923111101066?text=", "")),
    [waLink]
  );

  const subtotal = useMemo(() => price * qty, [price, qty]);
  const deliveryFee = useMemo(() => (subtotal >= 100000 ? 0 : 250), [subtotal]);
  const total = useMemo(() => subtotal + deliveryFee, [subtotal, deliveryFee]);

  const handleCheckout = () => setOpen("buy");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setFormError("Please fill required fields: Name, Phone and Address.");
      return;
    }
    if (!/^\+?[0-9\s-]{9,}$/.test(form.phone.trim())) {
      setFormError("Please enter a valid phone number.");
      return;
    }

    setFormError(null);
    addToCart(
      {
        id,
        slug,
        name,
        price,
        image,
      },
      qty
    );
    setOrderRef(`VAL-${Date.now().toString().slice(-6)}`);
    setSubmitted(true);
  };

  const closeModal = () => {
    setOpen(null);
    setSubmitted(false);
    setCopied(false);
    setFormError(null);
  };

  const copyWhatsAppMessage = async () => {
    try {
      await navigator.clipboard.writeText(waMessage);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <div className={`product-actions${compact ? " product-actions--compact" : ""}`}>
        <QtySelector value={qty} onChange={setQty} />

        <button
          type="button"
          className="btn btn-secondary product-add-btn"
          onClick={() =>
            inCart
              ? removeFromCart(id)
              : addToCart(
                  {
                    id,
                    slug,
                    name,
                    price,
                    image,
                  },
                  qty
                )
          }
        >
          {inCart ? "Remove from Cart" : "Add to Cart"}
        </button>

        <button type="button" className="btn btn-primary product-add-btn" onClick={handleCheckout}>
          Buy Now
        </button>

        <button
          type="button"
          className="btn product-buy-btn"
          onClick={() => setOpen("whatsapp")}
        >
          WhatsApp Order
        </button>

        <button
          type="button"
          className="btn product-buy-btn product-buy-primary"
          onClick={() => setOpen("quick")}
        >
          Quick Order
        </button>
      </div>

      <div className={`product-links-row${compact ? " product-links-row--compact" : ""}`}>
        <button
          type="button"
          className="product-link-btn"
          onClick={() => toggleWishlist({ slug, name, price, image })}
        >
          {inWishlist ? "Remove Wishlist" : "Save Wishlist"}
        </button>
        {!compact && (
          <button type="button" className="product-link-btn">
            Size Guide
          </button>
        )}
        <button type="button" className="product-link-btn">
          Delivery & Return
        </button>
        {!compact && (
          <button type="button" className="product-link-btn">
            Ask a Question
          </button>
        )}
      </div>

      {open && (
        <div className="buy-modal-overlay" role="dialog" aria-modal="true">
          <div className="buy-modal">
            <div className="buy-modal-header">
              <div>
                <h3 className="buy-modal-title">
                  {open === "buy" ? "Buy Now" : open === "whatsapp" ? "WhatsApp Order" : "Quick Order"}
                </h3>
                <p className="buy-modal-subtitle">{name}</p>
              </div>
              <button type="button" className="buy-modal-close" onClick={closeModal}>
                Close
              </button>
            </div>

            {submitted ? (
              <div className="buy-modal-success">
                <p className="buy-modal-success-title">Request Submitted</p>
                <p>
                  Reference: <strong>{orderRef}</strong>
                </p>
                <p>
                  {open === "buy"
                    ? "Your order request is placed. Our team will confirm by phone shortly."
                    : "Quick order received. Our team will contact you for confirmation."}
                </p>
                <p>
                  Payment method:{" "}
                  <strong>
                    {form.paymentMethod === "cod"
                      ? "Cash on Delivery"
                      : form.paymentMethod === "easypaisa"
                        ? "Easypaisa"
                        : "JazzCash"}
                  </strong>
                </p>
                <button type="button" className="btn btn-primary" onClick={closeModal}>
                  Done
                </button>
              </div>
            ) : open === "whatsapp" ? (
              <div className="buy-modal-form">
                <div className="buy-modal-summary buy-modal-summary-card">
                  <div className="buy-modal-summary-row">
                    <span>Product</span>
                    <strong>{name}</strong>
                  </div>
                  <div className="buy-modal-summary-row">
                    <span>Qty</span>
                    <strong>{qty}</strong>
                  </div>
                  <div className="buy-modal-summary-row">
                    <span>Total</span>
                    <strong>Rs {total.toLocaleString()}</strong>
                  </div>
                </div>
                <div className="form-field">
                  <label className="form-label">Message preview</label>
                  <textarea
                    className="form-input"
                    value={waMessage}
                    readOnly
                    style={{ minHeight: 110, resize: "vertical" }}
                  />
                </div>
                <div className="buy-modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={copyWhatsAppMessage}>
                    {copied ? "Copied" : "Copy Message"}
                  </button>
                  <a className="btn btn-primary" href={waLink} target="_blank" rel="noreferrer">
                    Open WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <form className="buy-modal-form" onSubmit={handleSubmit}>
                <p className="buy-modal-intro">
                  Fill details to place order. Payment confirmation will be completed by team on call/WhatsApp.
                </p>
                <div className="buy-modal-grid">
                  <div className="buy-modal-main">
                    <div className="form-field">
                      <label className="form-label" htmlFor="quick-name">
                        Name <span className="buy-required">*</span>
                      </label>
                      <input
                        id="quick-name"
                        className="form-input"
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label" htmlFor="quick-phone">
                        Phone <span className="buy-required">*</span>
                      </label>
                      <input
                        id="quick-phone"
                        className="form-input"
                        value={form.phone}
                        onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="+92 3xx xxxxxxx"
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label" htmlFor="quick-payment-method">
                        Payment Method <span className="buy-required">*</span>
                      </label>
                      <select
                        id="quick-payment-method"
                        className="form-input"
                        value={form.paymentMethod}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, paymentMethod: e.target.value }))
                        }
                        required
                      >
                        <option value="cod">Cash on Delivery (COD)</option>
                        <option value="easypaisa">Easypaisa (Manual Verify)</option>
                        <option value="jazzcash">JazzCash (Manual Verify)</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="form-label" htmlFor="quick-address">
                        Address <span className="buy-required">*</span>
                      </label>
                      <input
                        id="quick-address"
                        className="form-input"
                        value={form.address}
                        onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label" htmlFor="quick-note">
                        Note (optional)
                      </label>
                      <input
                        id="quick-note"
                        className="form-input"
                        value={form.note}
                        onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                      />
                    </div>
                    {formError && <p className="buy-modal-error">{formError}</p>}
                  </div>

                  <aside className="buy-modal-summary-card">
                    <h4 className="buy-modal-summary-title">Order Summary</h4>
                    <div className="buy-modal-summary-row">
                      <span>Item</span>
                      <strong>{name}</strong>
                    </div>
                    <div className="buy-modal-summary-row">
                      <span>Quantity</span>
                      <strong>{qty}</strong>
                    </div>
                    <div className="buy-modal-summary-row">
                      <span>Unit price</span>
                      <strong>Rs {price.toLocaleString()}</strong>
                    </div>
                    <div className="buy-modal-summary-row">
                      <span>Subtotal</span>
                      <strong>Rs {subtotal.toLocaleString()}</strong>
                    </div>
                    <div className="buy-modal-summary-row">
                      <span>Delivery</span>
                      <strong>{deliveryFee === 0 ? "Free" : `Rs ${deliveryFee.toLocaleString()}`}</strong>
                    </div>
                    <div className="buy-modal-summary-row">
                      <span>Payment</span>
                      <strong>
                        {form.paymentMethod === "cod"
                          ? "COD"
                          : form.paymentMethod === "easypaisa"
                            ? "Easypaisa"
                            : "JazzCash"}
                      </strong>
                    </div>
                    <div className="buy-modal-summary-row buy-modal-summary-row--total">
                      <span>Total</span>
                      <strong>Rs {total.toLocaleString()}</strong>
                    </div>
                    <p className="buy-modal-payment-note">
                      Online methods are confirmed manually after order placement.
                    </p>
                  </aside>
                </div>

                <div className="buy-modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {open === "buy" ? "Place Order" : "Submit Quick Order"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
