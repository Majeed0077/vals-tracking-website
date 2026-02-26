"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export const dynamic = "force-dynamic";

type PaymentProvider = "mock" | "stripe" | "jazzcash" | "easypaisa";
type PaymentStatus = "pending" | "authorized" | "captured" | "failed" | "refunded";

type OrderRef = {
  _id: string;
  total: number;
  status: string;
  paymentStatus: string;
  customer?: {
    email?: string;
    name?: string;
  };
};

type PaymentTransaction = {
  _id: string;
  orderId: string | OrderRef;
  provider: PaymentProvider;
  providerRef?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentUrl?: string;
  failureReason?: string;
  createdAt?: string;
};

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}

function getOrderIdValue(orderId: string | OrderRef): string {
  return typeof orderId === "string" ? orderId : orderId._id;
}

export default function AdminPaymentsPage() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [orders, setOrders] = useState<OrderRef[]>([]);

  const [providerFilter, setProviderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [provider, setProvider] = useState<PaymentProvider>("mock");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    const res = await fetch("/api/orders", { method: "GET", cache: "no-store" });
    const data: unknown = await res.json();

    const ok =
      typeof data === "object" &&
      data !== null &&
      "success" in data &&
      (data as { success: unknown }).success === true;

    if (!res.ok || !ok) {
      throw new Error("Failed to load orders for payment intent");
    }

    const list =
      typeof data === "object" &&
      data !== null &&
      "orders" in data &&
      Array.isArray((data as { orders?: unknown }).orders)
        ? ((data as { orders: OrderRef[] }).orders ?? [])
        : [];

    setOrders(list);
    if (!selectedOrderId && list.length > 0) {
      setSelectedOrderId(list[0]._id);
    }
  }, [selectedOrderId]);

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (providerFilter) params.set("provider", providerFilter);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/payments?${params.toString()}`, {
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
        const messageText =
          typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof (data as { message?: unknown }).message === "string"
            ? (data as { message: string }).message
            : "Failed to load payments";
        throw new Error(messageText);
      }

      const list =
        typeof data === "object" &&
        data !== null &&
        "transactions" in data &&
        Array.isArray((data as { transactions?: unknown }).transactions)
          ? ((data as { transactions: PaymentTransaction[] }).transactions ?? [])
          : [];

      setTransactions(list);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unexpected error while loading payments"));
    } finally {
      setLoading(false);
    }
  }, [providerFilter, statusFilter]);

  useEffect(() => {
    loadOrders().catch((err: unknown) => setError(getErrorMessage(err, "Failed to load orders")));
  }, [loadOrders]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const createIntent = useCallback(async () => {
    try {
      if (!selectedOrderId) throw new Error("Please select an order first");

      setSaving(true);
      setError(null);

      const res = await fetch("/api/payments/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: selectedOrderId, provider }),
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
            : "Failed to create payment intent";
        throw new Error(messageText);
      }

      await loadTransactions();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unexpected error while creating payment intent"));
    } finally {
      setSaving(false);
    }
  }, [selectedOrderId, provider, loadTransactions]);

  const updatePaymentStatus = useCallback(
    async (id: string, status: PaymentStatus) => {
      try {
        setSaving(true);
        setError(null);

        const res = await fetch(`/api/admin/payments/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
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
              : "Failed to update payment status";
          throw new Error(messageText);
        }

        await loadTransactions();
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Unexpected error while updating payment"));
      } finally {
        setSaving(false);
      }
    },
    [loadTransactions]
  );

  const totalAmount = useMemo(
    () => transactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0),
    [transactions]
  );

  return (
    <main className="section-block">
      <div className="container">
        <div className="admin-header">
          <div className="admin-header-text">
            <h1 className="page-hero-title admin-title">Payments</h1>
            <p className="page-hero-subtitle">Create payment intents and manage transaction status from admin panel.</p>
          </div>
        </div>

        <div className="admin-stats-grid admin-stats-grid--analytics">
          <div className="admin-stat-card">
            <p className="admin-stat-label">Transactions</p>
            <p className="admin-stat-value">{transactions.length}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Total Amount</p>
            <p className="admin-stat-value">Rs {Math.round(totalAmount).toLocaleString()}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Captured</p>
            <p className="admin-stat-value">{transactions.filter((tx) => tx.status === "captured").length}</p>
          </div>
        </div>

        {error && <div className="admin-error-banner">{error}</div>}

        <section className="admin-form-card">
          <div className="admin-form-header">
            <div>
              <h2 className="admin-form-title">Create Payment Intent</h2>
              <p className="admin-form-subtitle">Generate provider payment link for selected order.</p>
            </div>
          </div>

          <div className="admin-form-grid" style={{ gridTemplateColumns: "1.5fr 1fr auto" }}>
            <div className="form-field">
              <label className="form-label">Order</label>
              <select
                className="form-input"
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
              >
                <option value="">Select order</option>
                {orders.map((order) => (
                  <option key={order._id} value={order._id}>
                    #{order._id.slice(-6).toUpperCase()} | Rs {Math.round(order.total || 0).toLocaleString()} | {order.customer?.email || "Guest"}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Provider</label>
              <select className="form-input" value={provider} onChange={(e) => setProvider(e.target.value as PaymentProvider)}>
                <option value="mock">Mock</option>
                <option value="stripe">Stripe</option>
                <option value="jazzcash">JazzCash</option>
                <option value="easypaisa">Easypaisa</option>
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button className="btn btn-primary" type="button" onClick={createIntent} disabled={saving}>
                {saving ? "Creating..." : "Create Intent"}
              </button>
            </div>
          </div>
        </section>

        <section>
          <div className="admin-table-header">
            <h2 className="admin-table-title">Payment Transactions <span className="admin-count-pill">{transactions.length}</span></h2>
            <span className="admin-table-subtitle">Live provider transaction logs</span>
          </div>

          <section className="admin-form-card" style={{ marginBottom: 12 }}>
            <div className="admin-form-grid" style={{ gridTemplateColumns: "1fr 1fr auto" }}>
              <div className="form-field">
                <label className="form-label">Provider filter</label>
                <select className="form-input" value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)}>
                  <option value="">All providers</option>
                  <option value="mock">Mock</option>
                  <option value="stripe">Stripe</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="easypaisa">Easypaisa</option>
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Status filter</label>
                <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All status</option>
                  <option value="pending">Pending</option>
                  <option value="authorized">Authorized</option>
                  <option value="captured">Captured</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button className="btn btn-secondary" type="button" onClick={loadTransactions}>Apply</button>
              </div>
            </div>
          </section>

          <div className="admin-table-wrapper admin-table-scroll-5">
            {loading && transactions.length === 0 ? (
              <div className="admin-table-empty">Loading payment transactions...</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Provider</th>
                    <th>Ref</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Link</th>
                    <th>Created</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="admin-table-empty">No payment transactions found.</td>
                    </tr>
                  ) : (
                    transactions.map((tx) => {
                      const orderId = getOrderIdValue(tx.orderId);

                      return (
                        <tr key={tx._id}>
                          <td>#{orderId.slice(-6).toUpperCase()}</td>
                          <td>{tx.provider}</td>
                          <td>{tx.providerRef || "-"}</td>
                          <td>{tx.currency} {Math.round(tx.amount || 0).toLocaleString()}</td>
                          <td>
                            <span className={`admin-mini-pill admin-mini-pill--${tx.status}`}>{tx.status}</span>
                          </td>
                          <td>
                            {tx.paymentUrl ? (
                              <a className="admin-action-btn admin-action-edit" href={tx.paymentUrl} target="_blank" rel="noreferrer">
                                Open
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "-"}</td>
                          <td className="admin-table-actions">
                            <select
                              className="order-status-select"
                              value={tx.status}
                              onChange={(e) => updatePaymentStatus(tx._id, e.target.value as PaymentStatus)}
                              disabled={saving}
                            >
                              <option value="pending">Pending</option>
                              <option value="authorized">Authorized</option>
                              <option value="captured">Captured</option>
                              <option value="failed">Failed</option>
                              <option value="refunded">Refunded</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })
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
