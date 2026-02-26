"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export const dynamic = "force-dynamic";

type ReportSummary = {
  counts: {
    orders: number;
    customers: number;
  };
  finance: {
    revenue: number;
    cogs: number;
    refunds: number;
    netProfit: number;
    aov: number;
  };
  status: {
    pending: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  topProducts: Array<{
    name: string;
    qty: number;
    revenue: number;
  }>;
};

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}

function toDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function AdminReportsPage() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [from, setFrom] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return toDateInput(date);
  });
  const [to, setTo] = useState<string>(() => toDateInput(new Date()));

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);

      const res = await fetch(`/api/admin/reports/summary?${params.toString()}`, {
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
            : "Failed to load reports";
        throw new Error(messageText);
      }

      const payload =
        typeof data === "object" &&
        data !== null &&
        "summary" in data &&
        typeof (data as { summary?: unknown }).summary === "object"
          ? ((data as { summary: ReportSummary }).summary ?? null)
          : null;

      setSummary(payload);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unexpected error while loading reports"));
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const exportCsv = useCallback((entity: "orders" | "customers") => {
    const params = new URLSearchParams();
    params.set("entity", entity);
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    window.open(`/api/admin/reports/export?${params.toString()}`, "_blank");
  }, [from, to]);

  const totalStatusCount = useMemo(() => {
    if (!summary) return 0;
    return summary.status.pending + summary.status.shipped + summary.status.delivered + summary.status.cancelled;
  }, [summary]);

  return (
    <main className="section-block">
      <div className="container">
        <div className="admin-header">
          <div className="admin-header-text">
            <h1 className="page-hero-title admin-title">Reports</h1>
            <p className="page-hero-subtitle">Date-range reporting with finance summary and export tools.</p>
          </div>
        </div>

        {error && <div className="admin-error-banner">{error}</div>}

        <section className="admin-form-card">
          <div className="admin-form-grid" style={{ gridTemplateColumns: "1fr 1fr auto auto auto" }}>
            <div className="form-field">
              <label className="form-label">From</label>
              <input className="form-input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="form-field">
              <label className="form-label">To</label>
              <input className="form-input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button className="btn btn-secondary" type="button" onClick={loadSummary} disabled={loading}>
                {loading ? "Loading..." : "Apply"}
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button className="btn btn-secondary" type="button" onClick={() => exportCsv("orders")}>Export Orders CSV</button>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button className="btn btn-secondary" type="button" onClick={() => exportCsv("customers")}>Export Customers CSV</button>
            </div>
          </div>
        </section>

        <div className="admin-stats-grid admin-stats-grid--analytics">
          <div className="admin-stat-card">
            <p className="admin-stat-label">Orders</p>
            <p className="admin-stat-value">{summary?.counts.orders ?? 0}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Customers</p>
            <p className="admin-stat-value">{summary?.counts.customers ?? 0}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Revenue</p>
            <p className="admin-stat-value">Rs {Math.round(summary?.finance.revenue ?? 0).toLocaleString()}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">COGS</p>
            <p className="admin-stat-value">Rs {Math.round(summary?.finance.cogs ?? 0).toLocaleString()}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Refunds</p>
            <p className="admin-stat-value">Rs {Math.round(summary?.finance.refunds ?? 0).toLocaleString()}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Net Profit</p>
            <p className="admin-stat-value admin-profit">Rs {Math.round(summary?.finance.netProfit ?? 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="admin-insights-grid">
          <section className="admin-chart-card">
            <h3 className="admin-chart-title">Order Status Mix</h3>
            <p className="admin-chart-subtitle">Order states in selected date range</p>
            <div className="admin-status-bars" style={{ marginTop: 12 }}>
              {([
                ["pending", summary?.status.pending ?? 0],
                ["shipped", summary?.status.shipped ?? 0],
                ["delivered", summary?.status.delivered ?? 0],
                ["cancelled", summary?.status.cancelled ?? 0],
              ] as Array<["pending" | "shipped" | "delivered" | "cancelled", number]>).map(([status, count]) => {
                const pct = totalStatusCount > 0 ? (count / totalStatusCount) * 100 : 0;
                return (
                  <div key={status} className="status-row">
                    <div className="status-row-head">
                      <span>{status}</span>
                      <strong>{count}</strong>
                    </div>
                    <div className="status-track">
                      <span className={`status-fill is-${status}`} style={{ width: `${Math.max(0, pct)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="admin-chart-card">
            <h3 className="admin-chart-title">Finance Snapshot</h3>
            <p className="admin-chart-subtitle">AOV and margin indicators</p>
            <div className="admin-status-summary" style={{ marginTop: 12 }}>
              <div>
                <span>AOV</span>
                <strong>Rs {Math.round(summary?.finance.aov ?? 0).toLocaleString()}</strong>
              </div>
              <div>
                <span>Net Margin</span>
                <strong>
                  {summary && summary.finance.revenue > 0
                    ? `${Math.round((summary.finance.netProfit / summary.finance.revenue) * 100)}%`
                    : "0%"}
                </strong>
              </div>
            </div>
          </section>
        </div>

        <section>
          <div className="admin-table-header">
            <h2 className="admin-table-title">Top Products</h2>
            <span className="admin-table-subtitle">Best performing items by revenue</span>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {(summary?.topProducts ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="admin-table-empty">No product sales in selected range.</td>
                  </tr>
                ) : (
                  (summary?.topProducts ?? []).map((product) => (
                    <tr key={product.name}>
                      <td>{product.name}</td>
                      <td>{product.qty}</td>
                      <td>Rs {Math.round(product.revenue).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
