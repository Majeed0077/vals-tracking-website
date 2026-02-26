// app/admin/orders/page.tsx
"use client";

import { memo, useCallback, useEffect, useState } from "react";

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
  status: OrderStatus;
  paymentStatus?: "unpaid" | "paid" | "partially_refunded" | "refunded";
  paymentMethod?: string;
  paymentReference?: string;
  createdAt?: string | Date;
};

const MOCK_ORDERS: Order[] = [
  {
    _id: "mock-order-1001",
    customer: {
      name: "Ayesha Khan",
      email: "ayesha.khan@example.com",
      phone: "+92 300 1234567",
    },
    items: [
      { name: "Instinct 2 Solar - Tactical Edition", price: 162880, qty: 1 },
      { name: "eTrex 10", price: 47760, qty: 2 },
    ],
    total: 258400,
    status: "pending",
    createdAt: new Date("2025-02-14"),
  },
  {
    _id: "mock-order-1002",
    customer: {
      name: "Hamza Ali",
      email: "hamza.ali@example.com",
    },
    items: [{ name: "Tread - SxS Edition", price: 463600, qty: 1 }],
    total: 463600,
    status: "shipped",
    createdAt: new Date("2025-02-12"),
  },
  {
    _id: "mock-order-1003",
    customer: {
      name: "Sara Noor",
      email: "sara.noor@example.com",
      address: "DHA Phase 6, Lahore",
    },
    items: [
      { name: "Garmin Dash Cam Tandem", price: 104080, qty: 1 },
      { name: "Delta Smart Dog Training Bundle", price: 53840, qty: 1 },
    ],
    total: 157920,
    status: "delivered",
    createdAt: new Date("2025-02-08"),
  },
  {
    _id: "mock-order-1004",
    customer: {
      name: "Bilal Ahmed",
      email: "bilal.ahmed@example.com",
    },
    items: [{ name: "Vivosmart 5", price: 68999, qty: 1 }],
    total: 68999,
    status: "cancelled",
    createdAt: new Date("2025-02-04"),
  },
];

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [mockOrders, setMockOrders] = useState<Order[]>(MOCK_ORDERS);
  const [loading, setLoading] = useState(false);
  const [showSlowLoadingHint, setShowSlowLoadingHint] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
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
      setError(getErrorMessage(err, "Unexpected error while loading orders"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (!loading) {
      setShowSlowLoadingHint(false);
      return;
    }
    const timer = setTimeout(() => setShowSlowLoadingHint(true), 700);
    return () => clearTimeout(timer);
  }, [loading]);

  const usingMockOrders = !loading && orders.length === 0;
  const displayOrders = usingMockOrders ? mockOrders : orders;

  const updateOrderStatus = useCallback(async (id: string, status: OrderStatus) => {
    try {
      if (usingMockOrders) {
        setMockOrders((prev) =>
          prev.map((order) =>
            order._id === id ? { ...order, status } : order
          )
        );
        return;
      }
      setUpdatingId(id);
      setError(null);

      const res = await fetch(`/api/orders/${id}`, {
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
        const message =
          typeof data === "object" &&
            data !== null &&
            "message" in data &&
            typeof (data as { message?: unknown }).message === "string"
            ? (data as { message: string }).message
            : "Failed to update order";
        throw new Error(message);
      }

      setOrders((prev) =>
        prev.map((order) =>
          order._id === id ? { ...order, status } : order
        )
      );
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err, "Unexpected error while updating order"));
    } finally {
      setUpdatingId(null);
    }
  }, [usingMockOrders]);

  const verifyPayment = useCallback(async (id: string) => {
    try {
      if (usingMockOrders) {
        setMockOrders((prev) =>
          prev.map((order) =>
            order._id === id ? { ...order, paymentStatus: "paid" } : order
          )
        );
        return;
      }

      setVerifyingId(id);
      setError(null);

      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: "paid" }),
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
            : "Failed to verify payment";
        throw new Error(message);
      }

      setOrders((prev) =>
        prev.map((order) =>
          order._id === id ? { ...order, paymentStatus: "paid" } : order
        )
      );
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err, "Unexpected error while verifying payment"));
    } finally {
      setVerifyingId(null);
    }
  }, [usingMockOrders]);

  return (
    <main className="section-block">
      <div className="container">
        <h1 className="page-hero-title" style={{ marginBottom: 10 }}>
          Orders
        </h1>
        <p className="page-hero-subtitle" style={{ marginBottom: 20 }}>
          Track pending, shipped, delivered, or cancelled orders.
        </p>

        {error && <div className="admin-error-banner">{error}</div>}

        <OrdersTable
          orders={displayOrders}
          loading={loading}
          showSlowLoadingHint={showSlowLoadingHint}
          updatingId={updatingId}
          verifyingId={verifyingId}
          onStatusChange={updateOrderStatus}
          onVerifyPayment={verifyPayment}
          isMock={usingMockOrders}
        />
      </div>
    </main>
  );
}

const OrdersTable = memo(function OrdersTable({
  orders,
  loading,
  showSlowLoadingHint,
  updatingId,
  verifyingId,
  onStatusChange,
  onVerifyPayment,
  isMock,
}: {
  orders: Order[];
  loading: boolean;
  showSlowLoadingHint: boolean;
  updatingId: string | null;
  verifyingId: string | null;
  onStatusChange: (id: string, status: OrderStatus) => void;
  onVerifyPayment: (id: string) => void;
  isMock: boolean;
}) {
  return (
    <section>
      <div className="admin-table-header">
        <h2 className="admin-table-title">
          Orders <span className="admin-count-pill">{orders.length}</span>
        </h2>
        <span className="admin-table-subtitle">
          {isMock ? "Sample orders (dummy data)" : "Latest orders"}
        </span>
      </div>

      <div className="admin-table-wrapper">
        {loading && orders.length === 0 ? (
          <div className="admin-table-empty">
            {showSlowLoadingHint ? "Fetching latest orders..." : ""}
          </div>
        ) : orders.length === 0 ? (
          <table className="admin-table">
            <tbody>
              <tr>
                <td colSpan={8} className="admin-table-empty">
                  No orders yet.
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total (Rs)</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Created</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const itemCount = order.items.reduce(
                  (sum, item) => sum + item.qty,
                  0
                );
                const customerLabel =
                  order.customer?.name ||
                  order.customer?.email ||
                  "Guest";

                return (
                  <tr key={order._id}>
                    <td>#{order._id.slice(-6).toUpperCase()}</td>
                    <td>{customerLabel}</td>
                    <td>{itemCount} items</td>
                    <td>{order.total.toLocaleString()}</td>
                    <td>
                      <span className={`order-status-pill is-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "grid", gap: 2 }}>
                        <strong style={{ fontSize: 12 }}>
                          {order.paymentMethod || "COD"}
                        </strong>
                        <span style={{ fontSize: 12, opacity: 0.75 }}>
                          {order.paymentReference || "-"}
                        </span>
                      </div>
                    </td>
                    <td>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="admin-table-actions">
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
                        <select
                          className="order-status-select"
                          value={order.status}
                          disabled={updatingId === order._id}
                          onChange={(e) =>
                            onStatusChange(
                              order._id,
                              e.target.value as OrderStatus
                            )
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        {order.paymentStatus !== "paid" ? (
                          <button
                            type="button"
                            className="btn btn-primary"
                            disabled={verifyingId === order._id}
                            onClick={() => onVerifyPayment(order._id)}
                          >
                            {verifyingId === order._id ? "Verifying..." : "Verify Payment"}
                          </button>
                        ) : (
                          <span className="order-status-pill is-delivered">Paid</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
});
