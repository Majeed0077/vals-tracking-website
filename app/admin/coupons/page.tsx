"use client";

import { useCallback, useEffect, useState } from "react";

export const dynamic = "force-dynamic";

type CouponType = "percentage" | "fixed";

type Coupon = {
  _id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderTotal: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  validFrom?: string;
  validUntil?: string;
  notes?: string;
};

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [type, setType] = useState<CouponType>("percentage");
  const [value, setValue] = useState("");
  const [minOrderTotal, setMinOrderTotal] = useState("0");
  const [usageLimit, setUsageLimit] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");

  const loadCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/admin/coupons", { method: "GET", cache: "no-store" });
      const data: unknown = await res.json();

      const ok =
        typeof data === "object" &&
        data !== null &&
        "success" in data &&
        (data as { success: unknown }).success === true;

      if (!res.ok || !ok) {
        throw new Error("Failed to load coupons");
      }

      const list =
        typeof data === "object" &&
        data !== null &&
        "coupons" in data &&
        Array.isArray((data as { coupons?: unknown }).coupons)
          ? ((data as { coupons: Coupon[] }).coupons ?? [])
          : [];

      setCoupons(list);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unexpected error while loading coupons"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const createCoupon = useCallback(async () => {
    try {
      if (!code.trim() || !value.trim()) {
        throw new Error("Code and value are required");
      }

      setSaving(true);
      setError(null);

      const payload = {
        code: code.trim().toUpperCase(),
        type,
        value: Number(value),
        minOrderTotal: Number(minOrderTotal || 0),
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        validFrom: validFrom || undefined,
        validUntil: validUntil || undefined,
        notes: notes.trim() || undefined,
      };

      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: unknown = await res.json();

      const ok =
        typeof data === "object" &&
        data !== null &&
        "success" in data &&
        (data as { success: unknown }).success === true;

      if (!res.ok || !ok) {
        const messageText =
          typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof (data as { message?: unknown }).message === "string"
            ? (data as { message: string }).message
            : "Failed to create coupon";
        throw new Error(messageText);
      }

      setCode("");
      setValue("");
      setMinOrderTotal("0");
      setUsageLimit("");
      setValidFrom("");
      setValidUntil("");
      setNotes("");
      await loadCoupons();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unexpected error while creating coupon"));
    } finally {
      setSaving(false);
    }
  }, [code, type, value, minOrderTotal, usageLimit, validFrom, validUntil, notes, loadCoupons]);

  const toggleCoupon = useCallback(async (coupon: Coupon) => {
    try {
      setSaving(true);
      setError(null);

      const res = await fetch(`/api/admin/coupons/${coupon._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      const data: unknown = await res.json();
      const ok =
        typeof data === "object" &&
        data !== null &&
        "success" in data &&
        (data as { success: unknown }).success === true;

      if (!res.ok || !ok) {
        throw new Error("Failed to update coupon");
      }

      await loadCoupons();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unexpected error while updating coupon"));
    } finally {
      setSaving(false);
    }
  }, [loadCoupons]);

  const deleteCoupon = useCallback(async (coupon: Coupon) => {
    try {
      if (!confirm(`Delete coupon ${coupon.code}?`)) return;

      setSaving(true);
      setError(null);

      const res = await fetch(`/api/admin/coupons/${coupon._id}`, {
        method: "DELETE",
      });
      const data: unknown = await res.json();
      const ok =
        typeof data === "object" &&
        data !== null &&
        "success" in data &&
        (data as { success: unknown }).success === true;

      if (!res.ok || !ok) {
        throw new Error("Failed to delete coupon");
      }

      await loadCoupons();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unexpected error while deleting coupon"));
    } finally {
      setSaving(false);
    }
  }, [loadCoupons]);

  return (
    <main className="section-block">
      <div className="container">
        <div className="admin-header">
          <div className="admin-header-text">
            <h1 className="page-hero-title admin-title">Coupons</h1>
            <p className="page-hero-subtitle">Create and manage discount campaigns directly from admin panel.</p>
          </div>
        </div>

        {error && <div className="admin-error-banner">{error}</div>}

        <section className="admin-form-card">
          <div className="admin-form-header">
            <div>
              <h2 className="admin-form-title">Create Coupon</h2>
              <p className="admin-form-subtitle">Launch a new discount rule for checkout.</p>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="form-field">
              <label className="form-label">Code</label>
              <input className="form-input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="RAMADAN25" />
            </div>
            <div className="form-field">
              <label className="form-label">Type</label>
              <select className="form-input" value={type} onChange={(e) => setType(e.target.value as CouponType)}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Value</label>
              <input className="form-input" type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
            <div className="form-field">
              <label className="form-label">Min Order (Rs)</label>
              <input className="form-input" type="number" min="0" value={minOrderTotal} onChange={(e) => setMinOrderTotal(e.target.value)} />
            </div>
            <div className="form-field">
              <label className="form-label">Usage Limit</label>
              <input className="form-input" type="number" min="0" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} />
            </div>
            <div className="form-field">
              <label className="form-label">Valid From</label>
              <input className="form-input" type="datetime-local" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
            </div>
            <div className="form-field">
              <label className="form-label">Valid Until</label>
              <input className="form-input" type="datetime-local" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
            </div>
            <div className="form-field" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Notes</label>
              <textarea className="form-input" style={{ minHeight: 84, resize: "vertical" }} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div>
              <button className="btn btn-primary" type="button" onClick={createCoupon} disabled={saving}>
                {saving ? "Saving..." : "Create Coupon"}
              </button>
            </div>
          </div>
        </section>

        <section>
          <div className="admin-table-header">
            <h2 className="admin-table-title">Coupons <span className="admin-count-pill">{coupons.length}</span></h2>
            <span className="admin-table-subtitle">Manage active and expired offers</span>
          </div>

          <div className="admin-table-wrapper admin-table-scroll-5">
            {loading && coupons.length === 0 ? (
              <div className="admin-table-empty">Loading coupons...</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Discount</th>
                    <th>Min Order</th>
                    <th>Usage</th>
                    <th>Validity</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="admin-table-empty">No coupons found.</td>
                    </tr>
                  ) : (
                    coupons.map((coupon) => (
                      <tr key={coupon._id}>
                        <td>{coupon.code}</td>
                        <td>{coupon.type === "percentage" ? `${coupon.value}%` : `Rs ${coupon.value}`}</td>
                        <td>Rs {Math.round(coupon.minOrderTotal || 0).toLocaleString()}</td>
                        <td>{coupon.usedCount}/{coupon.usageLimit ?? "-"}</td>
                        <td>
                          {coupon.validFrom ? new Date(coupon.validFrom).toLocaleDateString() : "-"}
                          {" to "}
                          {coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString() : "-"}
                        </td>
                        <td>
                          <span className={`admin-mini-pill ${coupon.isActive ? "admin-mini-pill--sent" : "admin-mini-pill--failed"}`}>
                            {coupon.isActive ? "active" : "inactive"}
                          </span>
                        </td>
                        <td className="admin-table-actions">
                          <button className="admin-action-btn admin-action-edit" onClick={() => toggleCoupon(coupon)} disabled={saving}>
                            {coupon.isActive ? "Disable" : "Enable"}
                          </button>
                          <button className="admin-action-btn admin-action-delete" onClick={() => deleteCoupon(coupon)} disabled={saving}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
