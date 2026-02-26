"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export const dynamic = "force-dynamic";

type Address = {
  label?: string;
  fullName?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
};

type ProfileResponse = {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  addresses?: Address[];
  preferences?: {
    newsletter?: boolean;
    emailOffers?: boolean;
    smsAlerts?: boolean;
    whatsappAlerts?: boolean;
    language?: string;
    currency?: string;
  };
};

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}

export default function AccountSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarDataUrl, setAvatarDataUrl] = useState("");
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const [address, setAddress] = useState<Address>({
    label: "Home",
    country: "Pakistan",
    isDefaultShipping: true,
    isDefaultBilling: true,
  });

  const [newsletter, setNewsletter] = useState(true);
  const [emailOffers, setEmailOffers] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [whatsappAlerts, setWhatsappAlerts] = useState(false);
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("PKR");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const res = await fetch("/api/account/profile", { method: "GET", cache: "no-store" });
      const data: unknown = await res.json();

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const ok =
        typeof data === "object" &&
        data !== null &&
        "success" in data &&
        (data as { success: unknown }).success === true;

      if (!res.ok || !ok) {
        throw new Error("Failed to load profile");
      }

      const profile =
        typeof data === "object" &&
        data !== null &&
        "profile" in data &&
        typeof (data as { profile?: unknown }).profile === "object" &&
        (data as { profile?: unknown }).profile !== null
          ? ((data as { profile: ProfileResponse }).profile ?? null)
          : null;

      if (!profile) {
        throw new Error("Profile payload missing");
      }
      setEmail(profile.email || "");
      setFirstName(profile.firstName || "");
      setLastName(profile.lastName || "");
      setPhone(profile.phone || "");
      setAvatarUrl(profile.avatarUrl || "");
      setAvatarDataUrl("");
      setRemoveAvatar(false);
      setDateOfBirth(profile.dateOfBirth ? String(profile.dateOfBirth).slice(0, 10) : "");

      const defaultAddress =
        profile.addresses?.find((a) => a.isDefaultShipping) ||
        profile.addresses?.[0] ||
        {
          label: "Home",
          country: "Pakistan",
          isDefaultShipping: true,
          isDefaultBilling: true,
        };
      setAddress(defaultAddress);

      setNewsletter(Boolean(profile.preferences?.newsletter));
      setEmailOffers(Boolean(profile.preferences?.emailOffers));
      setSmsAlerts(Boolean(profile.preferences?.smsAlerts));
      setWhatsappAlerts(Boolean(profile.preferences?.whatsappAlerts));
      setLanguage(profile.preferences?.language || "en");
      setCurrency(profile.preferences?.currency || "PKR");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unexpected error while loading account settings"));
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const avatarFallback = useMemo(() => {
    const a = firstName.trim().charAt(0);
    const b = lastName.trim().charAt(0);
    const initials = `${a}${b}`.trim().toUpperCase();
    return initials || email.slice(0, 1).toUpperCase() || "U";
  }, [firstName, lastName, email]);

  const saveProfile = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload = {
        firstName,
        lastName,
        phone,
        avatarDataUrl: avatarDataUrl || undefined,
        removeAvatar,
        dateOfBirth: dateOfBirth || undefined,
        addresses: [
          {
            ...address,
            isDefaultShipping: true,
            isDefaultBilling: true,
          },
        ],
        preferences: {
          newsletter,
          emailOffers,
          smsAlerts,
          whatsappAlerts,
          language,
          currency,
        },
      };

      const res = await fetch("/api/account/profile", {
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
            : "Failed to save account settings";
        throw new Error(message);
      }

      if (avatarDataUrl) {
        setAvatarUrl(avatarDataUrl);
        setAvatarDataUrl("");
      }
      if (removeAvatar) {
        setAvatarUrl("");
        setRemoveAvatar(false);
      }
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }

      setSuccess("Settings saved successfully.");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unexpected error while saving profile"));
    } finally {
      setSaving(false);
    }
  }, [firstName, lastName, phone, avatarDataUrl, removeAvatar, dateOfBirth, address, newsletter, emailOffers, smsAlerts, whatsappAlerts, language, currency]);

  const handleAvatarFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type)) {
      setError("Avatar must be PNG, JPG or WEBP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Avatar must be under 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setAvatarDataUrl(result);
      setRemoveAvatar(false);
      setError(null);
    };
    reader.onerror = () => {
      setError("Failed to read avatar image.");
    };
    reader.readAsDataURL(file);
  }, []);

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

      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updateType: "password",
          currentPassword,
          newPassword,
        }),
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
            : "Failed to change password";
        throw new Error(message);
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Password changed successfully.");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unexpected error while changing password"));
    } finally {
      setSaving(false);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  return (
    <main className="section-block">
      <div className="container">
        <div className="admin-header">
          <div className="admin-header-text">
            <h1 className="page-hero-title admin-title">Account Settings</h1>
            <p className="page-hero-subtitle">Manage profile, addresses, preferences and security.</p>
          </div>
        </div>

        {error && <div className="admin-error-banner">{error}</div>}
        {success && <div className="admin-success-banner">{success}</div>}

        <section className="admin-form-card">
          <div className="admin-form-header">
            <div>
              <h2 className="admin-form-title">Profile</h2>
              <p className="admin-form-subtitle">Public identity and contact details</p>
            </div>
          </div>

          <div className="account-avatar-row">
            {avatarDataUrl || avatarUrl ? (
              <Image
                src={avatarDataUrl || avatarUrl}
                alt="Avatar"
                width={58}
                height={58}
                unoptimized
                className="account-avatar-large"
              />
            ) : (
              <div className="account-avatar-large account-avatar-fallback">{avatarFallback}</div>
            )}
            <div className="account-avatar-meta">
              <strong>{firstName || lastName ? `${firstName} ${lastName}`.trim() : "Your profile"}</strong>
              <span>{email}</span>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="form-field">
              <label className="form-label">Email</label>
              <input className="form-input" value={email} disabled />
            </div>
            <div className="form-field">
              <label className="form-label">First Name</label>
              <input className="form-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={loading} />
            </div>
            <div className="form-field">
              <label className="form-label">Last Name</label>
              <input className="form-input" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={loading} />
            </div>
            <div className="form-field">
              <label className="form-label">Phone</label>
              <input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loading} />
            </div>
            <div className="form-field">
              <label className="form-label">Date of Birth</label>
              <input className="form-input" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} disabled={loading} />
            </div>
            <div className="form-field">
              <label className="form-label">Upload Avatar (PNG/JPG/WEBP, max 10MB)</label>
              <input
                ref={avatarInputRef}
                className="form-input"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleAvatarFileChange}
                disabled={loading}
              />
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

        <section className="admin-form-card">
          <div className="admin-form-header">
            <div>
              <h2 className="admin-form-title">Default Address</h2>
              <p className="admin-form-subtitle">Shipping and billing primary address</p>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="form-field">
              <label className="form-label">Label</label>
              <input className="form-input" value={address.label || ""} onChange={(e) => setAddress((prev) => ({ ...prev, label: e.target.value }))} />
            </div>
            <div className="form-field">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={address.fullName || ""} onChange={(e) => setAddress((prev) => ({ ...prev, fullName: e.target.value }))} />
            </div>
            <div className="form-field">
              <label className="form-label">Phone</label>
              <input className="form-input" value={address.phone || ""} onChange={(e) => setAddress((prev) => ({ ...prev, phone: e.target.value }))} />
            </div>
            <div className="form-field" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Address Line 1</label>
              <input className="form-input" value={address.line1 || ""} onChange={(e) => setAddress((prev) => ({ ...prev, line1: e.target.value }))} />
            </div>
            <div className="form-field" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Address Line 2</label>
              <input className="form-input" value={address.line2 || ""} onChange={(e) => setAddress((prev) => ({ ...prev, line2: e.target.value }))} />
            </div>
            <div className="form-field">
              <label className="form-label">City</label>
              <input className="form-input" value={address.city || ""} onChange={(e) => setAddress((prev) => ({ ...prev, city: e.target.value }))} />
            </div>
            <div className="form-field">
              <label className="form-label">State/Province</label>
              <input className="form-input" value={address.state || ""} onChange={(e) => setAddress((prev) => ({ ...prev, state: e.target.value }))} />
            </div>
            <div className="form-field">
              <label className="form-label">Postal Code</label>
              <input className="form-input" value={address.postalCode || ""} onChange={(e) => setAddress((prev) => ({ ...prev, postalCode: e.target.value }))} />
            </div>
          </div>
        </section>

        <section className="admin-form-card">
          <div className="admin-form-header">
            <div>
              <h2 className="admin-form-title">Communication Preferences</h2>
              <p className="admin-form-subtitle">Marketing and notification controls</p>
            </div>
          </div>

          <div className="prefs-grid">
            <label className="prefs-item"><input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} /> Newsletter</label>
            <label className="prefs-item"><input type="checkbox" checked={emailOffers} onChange={(e) => setEmailOffers(e.target.checked)} /> Email Offers</label>
            <label className="prefs-item"><input type="checkbox" checked={smsAlerts} onChange={(e) => setSmsAlerts(e.target.checked)} /> SMS Alerts</label>
            <label className="prefs-item"><input type="checkbox" checked={whatsappAlerts} onChange={(e) => setWhatsappAlerts(e.target.checked)} /> WhatsApp Alerts</label>
            <div className="form-field">
              <label className="form-label">Language</label>
              <select className="form-input" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="en">English</option>
                <option value="ur">Urdu</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Currency</label>
              <select className="form-input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="PKR">PKR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary" type="button" onClick={saveProfile} disabled={saving || loading}>
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </section>

        <section className="admin-form-card">
          <div className="admin-form-header">
            <div>
              <h2 className="admin-form-title">Security</h2>
              <p className="admin-form-subtitle">Change your login password</p>
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

          <div style={{ marginTop: 16 }}>
            <button className="btn btn-secondary" type="button" onClick={changePassword} disabled={saving || loading}>
              {saving ? "Updating..." : "Update Password"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
