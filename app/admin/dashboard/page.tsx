// app/admin/dashboard/page.tsx
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";

// You can keep this if you really want to force dynamic behavior for Netlify
export const dynamic = "force-dynamic";

type Product = {
  _id: string;
  name: string;
  slug: string;
  image: string;
  category?: string;
  price: number;
  stock?: number;
  badge?: string;
  createdAt?: string | Date;
};

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

// helper: unknown -> message (no any)
function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Derived stats
  const { totalProducts, totalStock, stockValue } = useMemo(() => {
    return {
      totalProducts: products.length,
      totalStock: products.reduce((sum, p) => sum + (p.stock ?? 0), 0),
      stockValue: products.reduce(
        (sum, p) => sum + (p.stock ?? 0) * Number(p.price || 0),
        0
      ),
    };
  }, [products]);
  // placeholders for now – orders system baad me add karenge

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
    const maxRevenue = monthlySeries.reduce(
      (max, point) => Math.max(max, point.revenue),
      0
    );
    const maxOrders = monthlySeries.reduce(
      (max, point) => Math.max(max, point.orders),
      0
    );

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

  const loadProducts = useCallback(async () => {
    try {
      setError(null);

      const res = await fetch("/api/products", {
        method: "GET",
        cache: "no-store",
      });

      const data: unknown = await res.json();

      // minimal runtime guard (no any)
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
            : "Failed to load products";
        throw new Error(message);
      }

      const productsFromApi =
        typeof data === "object" &&
          data !== null &&
          "products" in data &&
          Array.isArray((data as { products?: unknown }).products)
          ? ((data as { products: Product[] }).products ?? [])
          : [];

      setProducts(productsFromApi);
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err, "Unexpected error while loading products"));
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      setOrdersError(null);

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
      setOrdersError(getErrorMessage(err, "Unexpected error while loading orders"));
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, [loadProducts, loadOrders]);

  return (
    <main className="section-block">
      <div className="container">
        {/* Top heading + actions */}
        <div className="admin-header">
          <div className="admin-header-text">
            <h1 className="page-hero-title admin-title">
              Admin Dashboard
            </h1>
            <p className="page-hero-subtitle">
              Overview of your VALS store performance.
            </p>
          </div>

          <div className="admin-header-actions">
            <Link href="/store" className="btn btn-secondary">
              View Store
            </Link>
            <Link href="/admin/analytics" className="btn btn-secondary">
              Analytics
            </Link>
            <Link
              href="/admin/products#product-form"
              className="btn btn-primary"
            >
              + Add Product
            </Link>
          </div>
        </div>

        {/* Stats cards */}
        <div className="admin-stats-grid admin-stats-grid--analytics">
          <div className="admin-stat-card">
            <p className="admin-stat-label">Total Products</p>
            <p className="admin-stat-value">{totalProducts}</p>
            <p className="admin-stat-sub">Stock units: {totalStock.toLocaleString()}</p>
          </div>

          <div className="admin-stat-card">
            <p className="admin-stat-label">Inventory Value</p>
            <p className="admin-stat-value">Rs {stockValue.toLocaleString()}</p>
            <p className="admin-stat-sub">Current shelf value estimate</p>
          </div>

          <div className="admin-stat-card">
            <p className="admin-stat-label">Gross Revenue</p>
            <p className="admin-stat-value">Rs {Math.round(analytics.grossRevenue).toLocaleString()}</p>
            <p className="admin-stat-sub">
              Delivered: Rs {Math.round(analytics.deliveredRevenue).toLocaleString()}
            </p>
          </div>

          <div className="admin-stat-card">
            <p className="admin-stat-label">Net Profit</p>
            <p className="admin-stat-value admin-profit">
              Rs {Math.round(analytics.actualProfit).toLocaleString()}
            </p>
            <p className="admin-stat-sub">
              COGS: Rs {Math.round(analytics.actualCogs).toLocaleString()}
            </p>
          </div>

          <div className="admin-stat-card">
            <p className="admin-stat-label">Loss & Refunds</p>
            <p className="admin-stat-value admin-loss">
              Rs {Math.round(analytics.actualLoss).toLocaleString()}
            </p>
            <p className="admin-stat-sub">
              Cancelled value: Rs {Math.round(analytics.cancelledValue).toLocaleString()}
            </p>
          </div>

          <div className="admin-stat-card">
            <p className="admin-stat-label">Net Outcome</p>
            <p
              className={`admin-stat-value ${
                analytics.netOutcome >= 0 ? "admin-profit" : "admin-loss"
              }`}
            >
              Rs {Math.round(analytics.netOutcome).toLocaleString()}
            </p>
            <p className="admin-stat-sub">
              AOV: Rs {Math.round(analytics.averageOrderValue).toLocaleString()}
            </p>
          </div>
        </div>

        {(error || ordersError) && (
          <div className="admin-error-banner">{error || ordersError}</div>
        )}
      </div>
    </main>
  );
}
