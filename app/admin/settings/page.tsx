"use client";

import { useCallback, useEffect, useState } from "react";

export const dynamic = "force-dynamic";

type SiteSetting = {
  _id?: string;
  marketing?: {
    announcementText?: string;
    heroBannerTitle?: string;
    heroBannerSubtitle?: string;
    promoEnabled?: boolean;
    promoText?: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    ogImage?: string;
  };
  commerce?: {
    productDetail?: {
      deliveryLocation?: string;
      standardDeliveryFee?: number;
      collectionPointFee?: number;
      codLabel?: string;
      returnPolicy?: string;
      warrantyLabel?: string;
      sellerName?: string;
      sellerRating?: number;
      shipOnTime?: number;
      responseTime?: string;
    };
  };
  updatedBy?: string;
  updatedAt?: string;
};

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [announcementText, setAnnouncementText] = useState("");
  const [heroBannerTitle, setHeroBannerTitle] = useState("");
  const [heroBannerSubtitle, setHeroBannerSubtitle] = useState("");
  const [promoEnabled, setPromoEnabled] = useState(false);
  const [promoText, setPromoText] = useState("");

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("Sindh, Karachi");
  const [standardDeliveryFee, setStandardDeliveryFee] = useState("140");
  const [collectionPointFee, setCollectionPointFee] = useState("30");
  const [codLabel, setCodLabel] = useState("Available");
  const [returnPolicy, setReturnPolicy] = useState("14 days easy return");
  const [warrantyLabel, setWarrantyLabel] = useState("12 months");
  const [sellerName, setSellerName] = useState("VALS Official Store");
  const [sellerRating, setSellerRating] = useState("93");
  const [shipOnTime, setShipOnTime] = useState("99");
  const [responseTime, setResponseTime] = useState("Fast");

  const [settingInfo, setSettingInfo] = useState<SiteSetting | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/admin/settings", { method: "GET", cache: "no-store" });
      const data: unknown = await res.json();

      const ok =
        typeof data === "object" &&
        data !== null &&
        "success" in data &&
        (data as { success: unknown }).success === true;

      if (!res.ok || !ok) {
        throw new Error("Failed to load settings");
      }

      const setting =
        typeof data === "object" &&
        data !== null &&
        "setting" in data &&
        typeof (data as { setting?: unknown }).setting === "object"
          ? ((data as { setting: SiteSetting }).setting ?? null)
          : null;

      setSettingInfo(setting);
      setAnnouncementText(setting?.marketing?.announcementText || "");
      setHeroBannerTitle(setting?.marketing?.heroBannerTitle || "");
      setHeroBannerSubtitle(setting?.marketing?.heroBannerSubtitle || "");
      setPromoEnabled(Boolean(setting?.marketing?.promoEnabled));
      setPromoText(setting?.marketing?.promoText || "");
      setMetaTitle(setting?.seo?.metaTitle || "");
      setMetaDescription(setting?.seo?.metaDescription || "");
      setMetaKeywords((setting?.seo?.metaKeywords || []).join(", "));
      setOgImage(setting?.seo?.ogImage || "");
      setDeliveryLocation(setting?.commerce?.productDetail?.deliveryLocation || "Sindh, Karachi");
      setStandardDeliveryFee(String(setting?.commerce?.productDetail?.standardDeliveryFee ?? 140));
      setCollectionPointFee(String(setting?.commerce?.productDetail?.collectionPointFee ?? 30));
      setCodLabel(setting?.commerce?.productDetail?.codLabel || "Available");
      setReturnPolicy(setting?.commerce?.productDetail?.returnPolicy || "14 days easy return");
      setWarrantyLabel(setting?.commerce?.productDetail?.warrantyLabel || "12 months");
      setSellerName(setting?.commerce?.productDetail?.sellerName || "VALS Official Store");
      setSellerRating(String(setting?.commerce?.productDetail?.sellerRating ?? 93));
      setShipOnTime(String(setting?.commerce?.productDetail?.shipOnTime ?? 99));
      setResponseTime(setting?.commerce?.productDetail?.responseTime || "Fast");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unexpected error while loading settings"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);

      const payload = {
        marketing: {
          announcementText: announcementText.trim() || undefined,
          heroBannerTitle: heroBannerTitle.trim() || undefined,
          heroBannerSubtitle: heroBannerSubtitle.trim() || undefined,
          promoEnabled,
          promoText: promoText.trim() || undefined,
        },
        seo: {
          metaTitle: metaTitle.trim() || undefined,
          metaDescription: metaDescription.trim() || undefined,
          metaKeywords: metaKeywords
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          ogImage: ogImage.trim() || undefined,
        },
        commerce: {
          productDetail: {
            deliveryLocation: deliveryLocation.trim() || "Sindh, Karachi",
            standardDeliveryFee: Math.max(0, Number(standardDeliveryFee || 0)),
            collectionPointFee: Math.max(0, Number(collectionPointFee || 0)),
            codLabel: codLabel.trim() || "Available",
            returnPolicy: returnPolicy.trim() || "14 days easy return",
            warrantyLabel: warrantyLabel.trim() || "12 months",
            sellerName: sellerName.trim() || "VALS Official Store",
            sellerRating: Math.max(0, Math.min(100, Number(sellerRating || 0))),
            shipOnTime: Math.max(0, Math.min(100, Number(shipOnTime || 0))),
            responseTime: responseTime.trim() || "Fast",
          },
        },
      };

      const res = await fetch("/api/admin/settings", {
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
        const messageText =
          typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof (data as { message?: unknown }).message === "string"
            ? (data as { message: string }).message
            : "Failed to save settings";
        throw new Error(messageText);
      }

      await loadSettings();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unexpected error while saving settings"));
    } finally {
      setSaving(false);
    }
  }, [announcementText, heroBannerTitle, heroBannerSubtitle, promoEnabled, promoText, metaTitle, metaDescription, metaKeywords, ogImage, deliveryLocation, standardDeliveryFee, collectionPointFee, codLabel, returnPolicy, warrantyLabel, sellerName, sellerRating, shipOnTime, responseTime, loadSettings]);

  return (
    <main className="section-block">
      <div className="container">
        <div className="admin-header">
          <div className="admin-header-text">
            <h1 className="page-hero-title admin-title">Settings</h1>
            <p className="page-hero-subtitle">Manage marketing text and SEO metadata from admin panel.</p>
          </div>
        </div>

        {error && <div className="admin-error-banner">{error}</div>}

        <section className="admin-form-card" style={{ marginBottom: 20 }}>
          <div className="admin-form-header">
            <div>
              <h2 className="admin-form-title">Marketing</h2>
              <p className="admin-form-subtitle">Homepage messaging and promo controls</p>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="form-field" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Announcement Text</label>
              <input className="form-input" value={announcementText} onChange={(e) => setAnnouncementText(e.target.value)} />
            </div>
            <div className="form-field">
              <label className="form-label">Hero Title</label>
              <input className="form-input" value={heroBannerTitle} onChange={(e) => setHeroBannerTitle(e.target.value)} />
            </div>
            <div className="form-field" style={{ gridColumn: "span 2" }}>
              <label className="form-label">Hero Subtitle</label>
              <input className="form-input" value={heroBannerSubtitle} onChange={(e) => setHeroBannerSubtitle(e.target.value)} />
            </div>
            <div className="form-field">
              <label className="form-label">Promo Enabled</label>
              <select className="form-input" value={promoEnabled ? "yes" : "no"} onChange={(e) => setPromoEnabled(e.target.value === "yes")}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <div className="form-field" style={{ gridColumn: "span 2" }}>
              <label className="form-label">Promo Text</label>
              <input className="form-input" value={promoText} onChange={(e) => setPromoText(e.target.value)} />
            </div>
          </div>
        </section>

        <section className="admin-form-card">
          <div className="admin-form-header">
            <div>
              <h2 className="admin-form-title">SEO</h2>
              <p className="admin-form-subtitle">Meta information used by search engines and social previews</p>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="form-field" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Meta Title</label>
              <input className="form-input" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
            </div>
            <div className="form-field" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Meta Description</label>
              <textarea className="form-input" style={{ minHeight: 88, resize: "vertical" }} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
            </div>
            <div className="form-field" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Meta Keywords (comma separated)</label>
              <input className="form-input" value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} />
            </div>
            <div className="form-field" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">OG Image URL</label>
              <input className="form-input" value={ogImage} onChange={(e) => setOgImage(e.target.value)} />
            </div>
            <div>
              <button className="btn btn-primary" type="button" onClick={saveSettings} disabled={saving || loading}>
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
            <div className="admin-form-subtitle" style={{ alignSelf: "center" }}>
              Last updated by: {settingInfo?.updatedBy || "-"}
            </div>
          </div>
        </section>

        <section className="admin-form-card" style={{ marginTop: 20 }}>
          <div className="admin-form-header">
            <div>
              <h2 className="admin-form-title">Store Product Detail Blocks</h2>
              <p className="admin-form-subtitle">Dynamic data for delivery, return and seller cards on product detail page.</p>
            </div>
          </div>
          <div className="admin-form-grid">
            <div className="form-field">
              <label className="form-label">Delivery Location</label>
              <input className="form-input" value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)} />
            </div>
            <div className="form-field">
              <label className="form-label">Standard Delivery Fee</label>
              <input className="form-input" type="number" min={0} value={standardDeliveryFee} onChange={(e) => setStandardDeliveryFee(e.target.value)} />
            </div>
            <div className="form-field">
              <label className="form-label">Collection Point Fee</label>
              <input className="form-input" type="number" min={0} value={collectionPointFee} onChange={(e) => setCollectionPointFee(e.target.value)} />
            </div>
            <div className="form-field">
              <label className="form-label">COD Label</label>
              <input className="form-input" value={codLabel} onChange={(e) => setCodLabel(e.target.value)} />
            </div>
            <div className="form-field">
              <label className="form-label">Return Policy</label>
              <input className="form-input" value={returnPolicy} onChange={(e) => setReturnPolicy(e.target.value)} />
            </div>
            <div className="form-field">
              <label className="form-label">Warranty Label</label>
              <input className="form-input" value={warrantyLabel} onChange={(e) => setWarrantyLabel(e.target.value)} />
            </div>
            <div className="form-field">
              <label className="form-label">Seller Name</label>
              <input className="form-input" value={sellerName} onChange={(e) => setSellerName(e.target.value)} />
            </div>
            <div className="form-field">
              <label className="form-label">Seller Rating %</label>
              <input className="form-input" type="number" min={0} max={100} value={sellerRating} onChange={(e) => setSellerRating(e.target.value)} />
            </div>
            <div className="form-field">
              <label className="form-label">Ship On Time %</label>
              <input className="form-input" type="number" min={0} max={100} value={shipOnTime} onChange={(e) => setShipOnTime(e.target.value)} />
            </div>
            <div className="form-field">
              <label className="form-label">Response Time</label>
              <input className="form-input" value={responseTime} onChange={(e) => setResponseTime(e.target.value)} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
