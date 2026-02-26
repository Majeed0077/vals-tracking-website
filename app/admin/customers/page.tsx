"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export const dynamic = "force-dynamic";

type CustomerSegment = "new" | "repeat" | "high_value" | "at_risk";

type Customer = {
  _id: string;
  email: string;
  name?: string;
  phone?: string;
  segment: CustomerSegment;
  orderCount: number;
  totalSpent: number;
  averageOrderValue: number;
  ltv: number;
  tags?: string[];
  notes?: string;
  lastOrderAt?: string;
  createdAt?: string;
};

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSlowLoadingHint, setShowSlowLoadingHint] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [segment, setSegment] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [editSegment, setEditSegment] = useState<CustomerSegment>("new");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (segment) params.set("segment", segment);

      const res = await fetch(`/api/admin/customers?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
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
            : "Failed to load customers";
        throw new Error(message);
      }

      const list =
        typeof data === "object" &&
        data !== null &&
        "customers" in data &&
        Array.isArray((data as { customers?: unknown }).customers)
          ? ((data as { customers: Customer[] }).customers ?? [])
          : [];

      setCustomers(list);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unexpected error while loading customers"));
    } finally {
      setLoading(false);
    }
  }, [q, segment]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    if (!loading) {
      setShowSlowLoadingHint(false);
      return;
    }
    const timer = setTimeout(() => setShowSlowLoadingHint(true), 700);
    return () => clearTimeout(timer);
  }, [loading]);

  const onSelectCustomer = useCallback((customer: Customer) => {
    setSelected(customer);
    setName(customer.name || "");
    setPhone(customer.phone || "");
    setEditSegment(customer.segment || "new");
    setTags((customer.tags || []).join(", "));
    setNotes(customer.notes || "");
  }, []);

  const saveCustomer = useCallback(async () => {
    if (!selected) return;

    try {
      setSaving(true);
      setError(null);

      const payload = {
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        segment: editSegment,
        tags: tags
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        notes: notes.trim() || undefined,
      };

      const res = await fetch(`/api/admin/customers/${selected._id}`, {
        method: "PUT",
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
        const message =
          typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof (data as { message?: unknown }).message === "string"
            ? (data as { message: string }).message
            : "Failed to update customer";
        throw new Error(message);
      }

      await loadCustomers();
      setSelected((prev) =>
        prev
          ? {
              ...prev,
              ...payload,
              tags: payload.tags,
            }
          : prev
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unexpected error while saving customer"));
    } finally {
      setSaving(false);
    }
  }, [selected, name, phone, editSegment, tags, notes, loadCustomers]);

  const totalLtv = useMemo(
    () => customers.reduce((sum, customer) => sum + Number(customer.ltv || 0), 0),
    [customers]
  );

  return (
    <main className="section-block">
      <div className="container">
        <div className="admin-header">
          <div className="admin-header-text">
            <h1 className="page-hero-title admin-title">Customers</h1>
            <p className="page-hero-subtitle">View customer segments, LTV and update CRM profile fields.</p>
          </div>
        </div>

        <div className="admin-stats-grid admin-stats-grid--analytics">
          <div className="admin-stat-card">
            <p className="admin-stat-label">Total Customers</p>
            <p className="admin-stat-value">{customers.length}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Combined LTV</p>
            <p className="admin-stat-value">Rs {Math.round(totalLtv).toLocaleString()}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">High Value</p>
            <p className="admin-stat-value">{customers.filter((c) => c.segment === "high_value").length}</p>
          </div>
        </div>

        {error && <div className="admin-error-banner">{error}</div>}

        <section className="admin-form-card" style={{ marginBottom: 16 }}>
          <div className="admin-form-grid" style={{ gridTemplateColumns: "2fr 1fr auto" }}>
            <div className="form-field">
              <label className="form-label" htmlFor="customer-search">Search</label>
              <input
                id="customer-search"
                className="form-input"
                placeholder="Name, email or phone"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="customer-segment">Segment</label>
              <select
                id="customer-segment"
                className="form-input"
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
              >
                <option value="">All segments</option>
                <option value="new">New</option>
                <option value="repeat">Repeat</option>
                <option value="high_value">High Value</option>
                <option value="at_risk">At Risk</option>
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button type="button" className="btn btn-secondary" onClick={loadCustomers}>
                Refresh
              </button>
            </div>
          </div>
        </section>

        <div className="admin-insights-grid" style={{ gridTemplateColumns: "1.55fr 1fr" }}>
          <section>
            <div className="admin-table-wrapper">
              {loading && customers.length === 0 ? (
                <div className="admin-table-empty">
                  {showSlowLoadingHint ? (
                    <div className="admin-inline-loader" role="status" aria-live="polite">
                      <div className="admin-inline-loader-ring" aria-hidden="true" />
                      <div className="admin-inline-loader-dots" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Segment</th>
                      <th>Orders</th>
                      <th>LTV</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="admin-table-empty">No customers found.</td>
                      </tr>
                    ) : (
                      customers.map((customer) => (
                        <tr key={customer._id}>
                          <td>{customer.name || "-"}</td>
                          <td>{customer.email}</td>
                          <td>{customer.segment}</td>
                          <td>{customer.orderCount || 0}</td>
                          <td>Rs {Math.round(customer.ltv || 0).toLocaleString()}</td>
                          <td className="admin-table-actions">
                            <button
                              className="admin-action-btn admin-action-edit"
                              onClick={() => onSelectCustomer(customer)}
                            >
                              Edit
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

          <section className="admin-form-card" style={{ marginBottom: 0 }}>
            <div className="admin-form-header">
              <div>
                <h2 className="admin-form-title">Customer Profile</h2>
                <p className="admin-form-subtitle">Select a customer to update CRM details.</p>
              </div>
            </div>

            {!selected ? (
              <p className="admin-form-subtitle" style={{ margin: 0 }}>No customer selected.</p>
            ) : (
              <div className="admin-form-grid" style={{ gridTemplateColumns: "1fr" }}>
                <div className="form-field">
                  <label className="form-label">Email</label>
                  <input className="form-input" value={selected.email} disabled />
                </div>
                <div className="form-field">
                  <label className="form-label">Name</label>
                  <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-field">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="form-field">
                  <label className="form-label">Segment</label>
                  <select
                    className="form-input"
                    value={editSegment}
                    onChange={(e) => setEditSegment(e.target.value as CustomerSegment)}
                  >
                    <option value="new">New</option>
                    <option value="repeat">Repeat</option>
                    <option value="high_value">High Value</option>
                    <option value="at_risk">At Risk</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Tags (comma separated)</label>
                  <input className="form-input" value={tags} onChange={(e) => setTags(e.target.value)} />
                </div>
                <div className="form-field">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-input"
                    style={{ minHeight: 96, resize: "vertical" }}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <div>
                  <button className="btn btn-primary" type="button" onClick={saveCustomer} disabled={saving}>
                    {saving ? "Saving..." : "Save Customer"}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
