"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";

type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled";

type OrderItem = {
  name: string;
  price: number;
  qty: number;
};

type OrderCustomer = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
};

type Order = {
  _id: string;
  customer?: OrderCustomer;
  items: OrderItem[];
  total: number;
  cogsTotal?: number;
  refundTotal?: number;
  grossProfit?: number;
  netProfit?: number;
  status: OrderStatus;
  createdAt?: string | Date;
};

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}

export default function AdminAnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/orders", {
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
            : "Failed to load orders";
        throw new Error(message);
      }

      const ordersFromApi =
        typeof data === "object" &&
        data !== null &&
        "orders" in data &&
        Array.isArray((data as { orders?: unknown }).orders)
          ? ((data as { orders: Order[] }).orders ?? [])
          : [];

      setOrders(ordersFromApi);
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err, "Unexpected error while loading analytics"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const analytics = useMemo(() => {
    const nonCancelled = orders.filter((order) => order.status !== "cancelled");
    const deliveredOrders = orders.filter((order) => order.status === "delivered");
    const cancelledOrders = orders.filter((order) => order.status === "cancelled");

    const totalOrders = orders.length;
    const activeOrders = nonCancelled.length;
    const deliveredCount = deliveredOrders.length;
    const cancelledCount = cancelledOrders.length;

    const grossRevenue = nonCancelled.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const deliveredRevenue = deliveredOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const cancelledValue = cancelledOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const averageOrderValue = activeOrders > 0 ? grossRevenue / activeOrders : 0;

    const actualCogs = nonCancelled.reduce((sum, order) => sum + Number(order.cogsTotal || 0), 0);
    const actualRefunds = orders.reduce((sum, order) => sum + Number(order.refundTotal || 0), 0);
    const actualProfit = nonCancelled.reduce(
      (sum, order) => sum + Number(order.netProfit ?? order.grossProfit ?? 0),
      0
    );
    const actualLoss = cancelledValue + actualRefunds;
    const netOutcome = actualProfit - actualLoss;

    const statusCounts: Record<OrderStatus, number> = {
      pending: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    const now = new Date();
    const monthlyMap = new Map<
      string,
      { label: string; revenue: number; orders: number; delivered: number }
    >();
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthlyMap.set(key, {
        label: d.toLocaleDateString(undefined, { month: "short" }),
        revenue: 0,
        delivered: 0,
        orders: 0,
      });
    }

    for (const order of orders) {
      statusCounts[order.status] += 1;
      const created = order.createdAt ? new Date(order.createdAt) : null;
      if (!created || Number.isNaN(created.getTime())) continue;

      const monthKey = `${created.getFullYear()}-${created.getMonth()}`;
      const bucket = monthlyMap.get(monthKey);
      if (!bucket) continue;

      bucket.orders += 1;
      if (order.status !== "cancelled") {
        bucket.revenue += Number(order.total || 0);
      }
      if (order.status === "delivered") {
        bucket.delivered += Number(order.total || 0);
      }
    }

    const monthlySeries = Array.from(monthlyMap.values());
    const maxRevenue = monthlySeries.reduce((max, point) => Math.max(max, point.revenue), 0);
    const maxOrders = monthlySeries.reduce((max, point) => Math.max(max, point.orders), 0);

    return {
      totalOrders,
      activeOrders,
      deliveredCount,
      cancelledCount,
      grossRevenue,
      deliveredRevenue,
      cancelledValue,
      averageOrderValue,
      actualProfit,
      actualCogs,
      actualLoss,
      netOutcome,
      statusCounts,
      monthlySeries,
      maxRevenue,
      maxOrders,
    };
  }, [orders]);

  return (
    <main className="section-block">
      <div className="container">
        <div className="admin-header">
          <div className="admin-header-text">
            <h1 className="page-hero-title admin-title">Business Analytics</h1>
            <p className="page-hero-subtitle">Profit, loss, revenue and order trend dashboard.</p>
          </div>
        </div>

        <div className="admin-stats-grid admin-stats-grid--analytics">
          <div className="admin-stat-card">
            <p className="admin-stat-label">Gross Revenue</p>
            <p className="admin-stat-value">Rs {Math.round(analytics.grossRevenue).toLocaleString()}</p>
            <p className="admin-stat-sub">Delivered: Rs {Math.round(analytics.deliveredRevenue).toLocaleString()}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Net Profit</p>
            <p className="admin-stat-value admin-profit">Rs {Math.round(analytics.actualProfit).toLocaleString()}</p>
            <p className="admin-stat-sub">COGS: Rs {Math.round(analytics.actualCogs).toLocaleString()}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Loss & Refunds</p>
            <p className="admin-stat-value admin-loss">Rs {Math.round(analytics.actualLoss).toLocaleString()}</p>
            <p className="admin-stat-sub">Cancelled: Rs {Math.round(analytics.cancelledValue).toLocaleString()}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Net Outcome</p>
            <p className={`admin-stat-value ${analytics.netOutcome >= 0 ? "admin-profit" : "admin-loss"}`}>
              Rs {Math.round(analytics.netOutcome).toLocaleString()}
            </p>
            <p className="admin-stat-sub">AOV: Rs {Math.round(analytics.averageOrderValue).toLocaleString()}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Total Orders</p>
            <p className="admin-stat-value">{analytics.totalOrders}</p>
            <p className="admin-stat-sub">Active: {analytics.activeOrders}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Fulfillment</p>
            <p className="admin-stat-value">{analytics.deliveredCount}</p>
            <p className="admin-stat-sub">Cancelled: {analytics.cancelledCount}</p>
          </div>
        </div>

        <section className="admin-insights-grid">
          <div className="admin-chart-card">
            <div className="admin-chart-head">
              <div>
                <h3 className="admin-chart-title">Revenue & Order Trend</h3>
                <p className="admin-chart-subtitle">Last 6 months performance snapshot</p>
              </div>
              <div className="admin-margin-control">
                <label>Accounting mode</label>
                <span className="order-status-select" style={{ display: "inline-flex", alignItems: "center" }}>
                  Real Data
                </span>
              </div>
            </div>
            <RevenueTrendChart
              monthlySeries={analytics.monthlySeries}
              maxRevenue={analytics.maxRevenue}
              maxOrders={analytics.maxOrders}
            />
          </div>

          <div className="admin-chart-card">
            <h3 className="admin-chart-title">Order Status Breakdown</h3>
            <p className="admin-chart-subtitle">
              {loading ? "Loading live order metrics..." : "Live order fulfillment mix"}
            </p>
            <StatusBreakdownCard
              statusCounts={analytics.statusCounts}
              totalOrders={analytics.totalOrders}
              deliveredCount={analytics.deliveredCount}
              cancelledCount={analytics.cancelledCount}
              activeOrders={analytics.activeOrders}
            />
          </div>
        </section>

        {error && <div className="admin-error-banner">{error}</div>}
      </div>
    </main>
  );
}

const RevenueTrendChart = memo(function RevenueTrendChart({
  monthlySeries,
  maxRevenue,
  maxOrders,
}: {
  monthlySeries: Array<{ label: string; revenue: number; orders: number; delivered: number }>;
  maxRevenue: number;
  maxOrders: number;
}) {
  const width = 560;
  const height = 220;
  const chartLeft = 26;
  const chartRight = width - 22;
  const chartTop = 20;
  const chartBottom = height - 44;
  const chartW = chartRight - chartLeft;
  const chartH = chartBottom - chartTop;

  const points = monthlySeries.map((point, index) => {
    const x = chartLeft + (chartW * index) / Math.max(1, monthlySeries.length - 1);
    const revenueY =
      chartBottom -
      ((maxRevenue > 0 ? point.revenue / maxRevenue : 0) * (chartH - 8) + 4);
    const barHeight = maxOrders > 0 ? (point.orders / maxOrders) * (chartH * 0.45) : 0;

    return {
      ...point,
      x,
      revenueY,
      barHeight,
      barY: chartBottom - barHeight,
    };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.revenueY.toFixed(2)}`)
    .join(" ");

  const areaPath =
    points.length > 1
      ? `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${chartBottom} L ${points[0].x} ${chartBottom} Z`
      : "";

  return (
    <div className="admin-trend-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="admin-trend-svg" role="img" aria-label="Revenue trend">
        <defs>
          <linearGradient id="adminRevenueArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(59,130,246,0.45)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0.02)" />
          </linearGradient>
        </defs>

        <line x1={chartLeft} y1={chartBottom} x2={chartRight} y2={chartBottom} className="trend-axis" />
        <line x1={chartLeft} y1={chartTop} x2={chartLeft} y2={chartBottom} className="trend-axis" />

        {points.map((point) => (
          <rect
            key={`${point.label}-bar`}
            x={point.x - 10}
            y={point.barY}
            width={20}
            height={point.barHeight}
            rx={5}
            className="trend-bar"
          />
        ))}

        {areaPath && <path d={areaPath} className="trend-area" />}
        {linePath && <path d={linePath} className="trend-line" />}

        {points.map((point) => (
          <g key={`${point.label}-point`}>
            <circle cx={point.x} cy={point.revenueY} r={3.8} className="trend-point" />
            <text x={point.x} y={height - 15} textAnchor="middle" className="trend-label">
              {point.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="admin-chart-legend">
        <span>
          <i className="legend-dot legend-dot--line" /> Revenue
        </span>
        <span>
          <i className="legend-dot legend-dot--bar" /> Orders
        </span>
      </div>
    </div>
  );
});

const StatusBreakdownCard = memo(function StatusBreakdownCard({
  statusCounts,
  totalOrders,
  activeOrders,
  deliveredCount,
  cancelledCount,
}: {
  statusCounts: Record<OrderStatus, number>;
  totalOrders: number;
  activeOrders: number;
  deliveredCount: number;
  cancelledCount: number;
}) {
  const statusRows: Array<{ key: OrderStatus; label: string }> = [
    { key: "pending", label: "Pending" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="admin-status-block">
      <div className="admin-status-summary">
        <div>
          <span>Total Orders</span>
          <strong>{totalOrders}</strong>
        </div>
        <div>
          <span>Active</span>
          <strong>{activeOrders}</strong>
        </div>
        <div>
          <span>Delivered</span>
          <strong>{deliveredCount}</strong>
        </div>
        <div>
          <span>Cancelled</span>
          <strong>{cancelledCount}</strong>
        </div>
      </div>

      <div className="admin-status-bars">
        {statusRows.map((row) => {
          const count = statusCounts[row.key] || 0;
          const pct = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
          return (
            <div key={row.key} className="status-row">
              <div className="status-row-head">
                <span>{row.label}</span>
                <strong>{count}</strong>
              </div>
              <div className="status-track">
                <span
                  className={`status-fill is-${row.key}`}
                  style={{ width: `${count === 0 ? 0 : Math.max(8, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
