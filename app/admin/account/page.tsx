"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

export const dynamic = "force-dynamic";

type AdminAccount = {
  email: string;
  name?: string;
  phone?: string;
  avatarUrl?: string;
  jobTitle?: string;
  department?: string;
  timezone?: string;
  preferences?: {
    emailAlerts?: boolean;
    orderAlerts?: boolean;
    lowStockAlerts?: boolean;
    reportDigest?: boolean;
    language?: string;
  };
  updatedAt?: string;
};

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}

export default function AdminAccountPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [timezone, setTimezone] = useState("Asia/Karachi");

  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarDataUrl, setAvatarDataUrl] = useState("");
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [reportDigest, setReportDigest] = useState(false);
  const [language, setLanguage] = useState("en");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const loadAccount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/admin/account", { method: "GET", cache: "no-store", credentials: "include" });
      const data: unknown = await res.json();

      const ok =
        typeof data === "object" &&
        data !== null &&
        "success" in data &&
        (data as { success: unknown }).success === true;

      if (!res.ok || !ok) {
        const message =
          typeof data === "object" && data !== null && "message" in data && typeof (data as { message?: unknown }).message === "string"
            ? (data as { message: string }).message
            : "Failed to load admin account";
        throw new Error(message);
      }

      const account =
        typeof data === "object" &&
        data !== null &&
        "account" in data &&
        typeof (data as { account?: unknown }).account === "object"
          ? ((data as { account: AdminAccount }).account ?? null)
          : null;

      if (!account) {
        throw new Error("Admin account payload missing");
      }

      setEmail(account.email || "");
      setName(account.name || "");
      setPhone(account.phone || "");
      setJobTitle(account.jobTitle || "");
      setDepartment(account.department || "");
      setTimezone(account.timezone || "Asia/Karachi");
      setAvatarUrl(account.avatarUrl || "");
      setAvatarDataUrl("");
      setRemoveAvatar(false);
      setEmailAlerts(Boolean(account.preferences?.emailAlerts));
      setOrderAlerts(Boolean(account.preferences?.orderAlerts));
      setLowStockAlerts(Boolean(account.preferences?.lowStockAlerts));
      setReportDigest(Boolean(account.preferences?.reportDigest));
      setLanguage(account.preferences?.language || "en");
      setLastUpdated(account.updatedAt || null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unexpected error while loading admin account"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  const avatarFallback = useMemo(() => {
    const initial = name.trim().charAt(0).toUpperCase() || email.trim().charAt(0).toUpperCase();
    return initial || "A";
  }, [name, email]);

  const handleAvatarFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      setError('Avatar must be PNG, JPG or WEBP.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Avatar must be under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setAvatarDataUrl(result);
      setRemoveAvatar(false);
      setError(null);
    };
    reader.onerror = () => setError("Failed to read avatar image.");
    reader.readAsDataURL(file);
  }, []);

  const saveProfile = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload = {
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        jobTitle: jobTitle.trim() || undefined,
        department: department.trim() || undefined,
        timezone,
        avatarDataUrl: avatarDataUrl || undefined,
        removeAvatar,
        preferences: {
          emailAlerts,
          orderAlerts,
          lowStockAlerts,
          reportDigest,
          language,
        },
      };

      const res = await fetch("/api/admin/account", {
        method: "PUT",
        credentials: "include",
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
          typeof data === "object" && data !== null && "message" in data && typeof (data as { message?: unknown }).message === "string"
            ? (data as { message: string }).message
            : "Failed to save admin account";
        throw new Error(message);
      }

      const updatedAccount =
        typeof data === "object" &&
        data !== null &&
        "account" in data &&
        typeof (data as { account?: unknown }).account === "object"
          ? ((data as { account: AdminAccount }).account ?? null)
          : null;

      if (updatedAccount) {
        setEmail(updatedAccount.email || "");
        setName(updatedAccount.name || "");
        setPhone(updatedAccount.phone || "");
        setJobTitle(updatedAccount.jobTitle || "");
        setDepartment(updatedAccount.department || "");
        setTimezone(updatedAccount.timezone || "Asia/Karachi");
        setAvatarUrl(updatedAccount.avatarUrl || "");
        setEmailAlerts(Boolean(updatedAccount.preferences?.emailAlerts));
        setOrderAlerts(Boolean(updatedAccount.preferences?.orderAlerts));
        setLowStockAlerts(Boolean(updatedAccount.preferences?.lowStockAlerts));
        setReportDigest(Boolean(updatedAccount.preferences?.reportDigest));
        setLanguage(updatedAccount.preferences?.language || "en");
        setLastUpdated(updatedAccount.updatedAt || null);
      }

      setAvatarDataUrl("");
      setRemoveAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";

      setSuccess("Admin settings updated.");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unexpected error while saving admin account"));
    } finally {
      setSaving(false);
    }
  }, [name, phone, jobTitle, department, timezone, avatarDataUrl, removeAvatar, emailAlerts, orderAlerts, lowStockAlerts, reportDigest, language]);

  const changePassword = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (!currentPassword || !newPassword) {
        throw new Error("Current and new password are required.");
      }
      if (newPassword.length < 8) {
        throw new Error("New password must be at least 8 characters.");
      }
      if (newPassword !== confirmPassword) {
        throw new Error("Confirm password does not match.");
      }

      const res = await fetch("/api/admin/account", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updateType: "password", currentPassword, newPassword }),
      });
      const data: unknown = await res.json();

      const ok =
        typeof data === "object" &&
        data !== null &&
        "success" in data &&
        (data as { success: unknown }).success === true;

      if (!res.ok || !ok) {
        const message =
          typeof data === "object" && data !== null && "message" in data && typeof (data as { message?: unknown }).message === "string"
            ? (data as { message: string }).message
            : "Failed to update password";
        throw new Error(message);
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Password updated successfully.");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unexpected error while updating password"));
    } finally {
      setSaving(false);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  return (
    <main className="section-block">
      <div className="container">
        <div className="admin-header">
          <div className="admin-header-text">
            <h1 className="page-hero-title admin-title">Admin Account</h1>
            <p className="page-hero-subtitle">Manage your profile, alerts and admin security.</p>
          </div>
        </div>

        {error && <div className="admin-error-banner">{error}</div>}
        {success && <div className="admin-success-banner">{success}</div>}

        <section className="admin-form-card" style={{ marginBottom: 20 }}>
          <div className="admin-form-header">
            <div>
              <h2 className="admin-form-title">Profile</h2>
              <p className="admin-form-subtitle">Personal admin identity and role context</p>
            </div>
          </div>

          <div className="account-avatar-row">
            {avatarDataUrl || avatarUrl ? (
              <Image src={avatarDataUrl || avatarUrl} alt="Admin avatar" width={58} height={58} unoptimized className="account-avatar-large" />
            ) : (
              <div className="account-avatar-large account-avatar-fallback">{avatarFallback}</div>
            )}
            <div className="account-avatar-meta">
              <strong>{name || "Admin Account"}</strong>
              <span>{email}</span>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="form-field">
              <label className="form-label">Email</label>
              <input className="form-input" value={email} disabled />
            </div>
            <div className="form-field">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
            </div>
            <div className="form-field">
              <label className="form-label">Phone</label>
              <input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loading} />
            </div>
            <div className="form-field">
              <label className="form-label">Job Title</label>
              <input className="form-input" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} disabled={loading} />
            </div>
            <div className="form-field">
              <label className="form-label">Department</label>
              <input className="form-input" value={department} onChange={(e) => setDepartment(e.target.value)} disabled={loading} />
            </div>
            <div className="form-field">
              <label className="form-label">Timezone</label>
              <select className="form-input" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                <option value="Asia/Karachi">Asia/Karachi</option>
                <option value="Asia/Dubai">Asia/Dubai</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Upload Avatar (PNG/JPG/WEBP, max 10MB)</label>
              <input ref={avatarInputRef} className="form-input" type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleAvatarFileChange} disabled={loading} />
            </div>
            <div className="form-field" style={{ justifyContent: "flex-end" }}>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => {
                  setAvatarDataUrl("");
                  setAvatarUrl("");
                  setRemoveAvatar(true);
                  if (avatarInputRef.current) avatarInputRef.current.value = "";
                }}
                disabled={loading}
              >
                Remove Avatar
              </button>
            </div>
          </div>
        </section>

        <section className="admin-form-card" style={{ marginBottom: 20 }}>
          <div className="admin-form-header">
            <div>
              <h2 className="admin-form-title">Admin Alerts & Preferences</h2>
              <p className="admin-form-subtitle">Operational notifications for daily management</p>
            </div>
          </div>

          <div className="prefs-grid">
            <label className="prefs-item"><input type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} /> Email Alerts</label>
            <label className="prefs-item"><input type="checkbox" checked={orderAlerts} onChange={(e) => setOrderAlerts(e.target.checked)} /> Order Status Alerts</label>
            <label className="prefs-item"><input type="checkbox" checked={lowStockAlerts} onChange={(e) => setLowStockAlerts(e.target.checked)} /> Low Stock Alerts</label>
            <label className="prefs-item"><input type="checkbox" checked={reportDigest} onChange={(e) => setReportDigest(e.target.checked)} /> Daily Report Digest</label>
            <div className="form-field">
              <label className="form-label">Language</label>
              <select className="form-input" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="en">English</option>
                <option value="ur">Urdu</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 16 }}>
            <button className="btn btn-primary" type="button" onClick={saveProfile} disabled={saving || loading}>
              {saving ? "Saving..." : "Save Admin Settings"}
            </button>
            <span className="admin-form-subtitle">
              Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : "-"}
            </span>
          </div>
        </section>

        <section className="admin-form-card">
          <div className="admin-form-header">
            <div>
              <h2 className="admin-form-title">Security</h2>
              <p className="admin-form-subtitle">Rotate admin password securely</p>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="form-field">
              <label className="form-label">Current Password</label>
              <input className="form-input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="form-field">
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="form-field">
              <label className="form-label">Confirm New Password</label>
              <input className="form-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <button className="btn btn-secondary" type="button" onClick={changePassword} disabled={saving || loading}>
              {saving ? "Updating..." : "Update Password"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
