"use client";

import { useCallback, useEffect, useState } from "react";

export const dynamic = "force-dynamic";

type NotificationChannel = "email" | "sms" | "whatsapp" | "in_app";
type NotificationStatus = "queued" | "sent" | "failed";

type NotificationLog = {
  _id: string;
  channel: NotificationChannel;
  to: string;
  subject?: string;
  message: string;
  status: NotificationStatus;
  createdAt?: string;
};

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSlowLoadingHint, setShowSlowLoadingHint] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [channelFilter, setChannelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [channel, setChannel] = useState<NotificationChannel>("email");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (channelFilter) params.set("channel", channelFilter);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/notifications?${params.toString()}`, {
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
            : "Failed to load notifications";
        throw new Error(messageText);
      }

      const list =
        typeof data === "object" &&
        data !== null &&
        "notifications" in data &&
        Array.isArray((data as { notifications?: unknown }).notifications)
          ? ((data as { notifications: NotificationLog[] }).notifications ?? [])
          : [];

      setNotifications(list);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unexpected error while loading notifications"));
    } finally {
      setLoading(false);
    }
  }, [channelFilter, statusFilter]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!loading) {
      setShowSlowLoadingHint(false);
      return;
    }
    const timer = setTimeout(() => setShowSlowLoadingHint(true), 700);
    return () => clearTimeout(timer);
  }, [loading]);

  const sendNotification = useCallback(async () => {
    try {
      if (!to.trim() || !message.trim()) {
        throw new Error("Recipient and message are required");
      }

      setSending(true);
      setError(null);

      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          to: to.trim(),
          subject: subject.trim() || undefined,
          message: message.trim(),
        }),
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
            : "Failed to send notification";
        throw new Error(messageText);
      }

      setTo("");
      setSubject("");
      setMessage("");
      await loadNotifications();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unexpected error while sending notification"));
    } finally {
      setSending(false);
    }
  }, [channel, to, subject, message, loadNotifications]);

  return (
    <main className="section-block">
      <div className="container">
        <div className="admin-header">
          <div className="admin-header-text">
            <h1 className="page-hero-title admin-title">Notifications</h1>
            <p className="page-hero-subtitle">Trigger email/SMS/WhatsApp/in-app notifications and monitor delivery logs.</p>
          </div>
        </div>

        {error && <div className="admin-error-banner">{error}</div>}

        <section className="admin-form-card">
          <div className="admin-form-header">
            <div>
              <h2 className="admin-form-title">Send Notification</h2>
              <p className="admin-form-subtitle">Create a notification directly from admin panel.</p>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="form-field">
              <label className="form-label">Channel</label>
              <select className="form-input" value={channel} onChange={(e) => setChannel(e.target.value as NotificationChannel)}>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="in_app">In-app</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Recipient</label>
              <input className="form-input" value={to} onChange={(e) => setTo(e.target.value)} placeholder="email/phone/user id" />
            </div>
            <div className="form-field">
              <label className="form-label">Subject (optional)</label>
              <input className="form-input" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="form-field" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Message</label>
              <textarea
                className="form-input"
                style={{ minHeight: 90, resize: "vertical" }}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div>
              <button className="btn btn-primary" type="button" onClick={sendNotification} disabled={sending}>
                {sending ? "Sending..." : "Send Notification"}
              </button>
            </div>
          </div>
        </section>

        <section>
          <div className="admin-table-header">
            <h2 className="admin-table-title">Notification Logs <span className="admin-count-pill">{notifications.length}</span></h2>
            <span className="admin-table-subtitle">Latest delivery status</span>
          </div>

          <section className="admin-form-card" style={{ marginBottom: 12 }}>
            <div className="admin-form-grid" style={{ gridTemplateColumns: "1fr 1fr auto" }}>
              <div className="form-field">
                <label className="form-label">Channel filter</label>
                <select className="form-input" value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)}>
                  <option value="">All channels</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="in_app">In-app</option>
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Status filter</label>
                <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All status</option>
                  <option value="queued">Queued</option>
                  <option value="sent">Sent</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button className="btn btn-secondary" type="button" onClick={loadNotifications}>Apply</button>
              </div>
            </div>
          </section>

          <div className="admin-table-wrapper admin-table-scroll-5">
            {loading && notifications.length === 0 ? (
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
                    <th>Channel</th>
                    <th>To</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="admin-table-empty">No notifications found.</td>
                    </tr>
                  ) : (
                    notifications.map((item) => (
                      <tr key={item._id}>
                        <td>{item.channel}</td>
                        <td>{item.to}</td>
                        <td>{item.subject || "-"}</td>
                        <td>{item.message}</td>
                        <td>
                          <span className={`admin-mini-pill admin-mini-pill--${item.status}`}>{item.status}</span>
                        </td>
                        <td>{item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}</td>
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
