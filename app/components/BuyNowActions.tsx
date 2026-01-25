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
};

export default function BuyNowActions({ id, name, price, slug, image }: BuyNowActionsProps) {
  const addToCart = useShopStore((state) => state.addToCart);
  const removeFromCart = useShopStore((state) => state.removeFromCart);
  const toggleWishlist = useShopStore((state) => state.toggleWishlist);
  const wishlist = useShopStore((state) => state.wishlist);
  const cart = useShopStore((state) => state.cart);
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", note: "" });
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

  const handleCheckout = () => {
    alert("Checkout is coming soon. This is a demo button for now.");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const closeModal = () => {
    setOpen(false);
    setSubmitted(false);
  };

  return (
    <>
      <div className="product-actions">
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

        <a className="btn product-buy-btn" href={waLink} target="_blank" rel="noreferrer">
          WhatsApp Order
        </a>

        <button
          type="button"
          className="btn product-buy-btn product-buy-primary"
          onClick={() => setOpen(true)}
        >
          Quick Order
        </button>
      </div>

      <div className="product-links-row">
        <button
          type="button"
          className="product-link-btn"
          onClick={() => toggleWishlist({ slug, name, price, image })}
        >
          {inWishlist ? "Remove Wishlist" : "Save Wishlist"}
        </button>
        <button type="button" className="product-link-btn">
          Size Guide
        </button>
        <button type="button" className="product-link-btn">
          Delivery & Return
        </button>
        <button type="button" className="product-link-btn">
          Ask a Question
        </button>
      </div>

      {open && (
        <div className="buy-modal-overlay" role="dialog" aria-modal="true">
          <div className="buy-modal">
            <div className="buy-modal-header">
              <div>
                <h3 className="buy-modal-title">Quick Order</h3>
                <p className="buy-modal-subtitle">{name}</p>
              </div>
              <button type="button" className="buy-modal-close" onClick={closeModal}>
                Close
              </button>
            </div>

            {submitted ? (
              <div className="buy-modal-success">
                <p>Your request has been submitted (demo).</p>
                <button type="button" className="btn btn-primary" onClick={closeModal}>
                  Done
                </button>
              </div>
            ) : (
              <form className="buy-modal-form" onSubmit={handleSubmit}>
                <div className="form-field">
                  <label className="form-label" htmlFor="quick-name">
                    Name
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
                    Phone
                  </label>
                  <input
                    id="quick-phone"
                    className="form-input"
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="quick-address">
                    Address
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

                <div className="buy-modal-summary">
                  Qty: {qty} | Total: Rs {Number(price * qty).toLocaleString()}
                </div>

                <div className="buy-modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Request
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
