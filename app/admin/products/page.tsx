"use client";

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Link from "next/link";
import Image from "next/image";

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
  discount?: {
    type: "percentage" | "fixed";
    value: number;
    startAt?: string | Date;
    endAt?: string | Date;
  };
  createdAt?: string | Date;
};

type FormState = {
  name: string;
  slug: string;
  image: string;
  category: string;
  price: string;
  stock: string;
  badge: string;
  discountType: "none" | "percentage" | "fixed";
  discountValue: string;
  discountStartAt: string;
  discountEndAt: string;
};

const INITIAL_FORM: FormState = {
  name: "",
  slug: "",
  image: "",
  category: "",
  price: "",
  stock: "",
  badge: "",
  discountType: "none",
  discountValue: "",
  discountStartAt: "",
  discountEndAt: "",
};

function toInputDateTime(value?: string | Date) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") resolve(result);
      else reject(new Error("Failed to read file"));
    };
    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSlowLoadingHint, setShowSlowLoadingHint] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const isCreateMode = !editingId;

  const clearObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/products", { method: "GET", cache: "no-store" });
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
            : "Failed to load products";
        throw new Error(message);
      }

      const list =
        typeof data === "object" &&
        data !== null &&
        "products" in data &&
        Array.isArray((data as { products?: unknown }).products)
          ? ((data as { products: Product[] }).products ?? [])
          : [];

      setProducts(list);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unexpected error while loading products"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => () => clearObjectUrl(), [clearObjectUrl]);

  useEffect(() => {
    if (!loading) {
      setShowSlowLoadingHint(false);
      return;
    }
    const timer = setTimeout(() => setShowSlowLoadingHint(true), 700);
    return () => clearTimeout(timer);
  }, [loading]);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleImageChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      if (!file) {
        clearObjectUrl();
        setImageFile(null);
        setImagePreview("");
        return;
      }

      const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setError("Only PNG, JPG, JPEG, or WEBP images are allowed.");
        e.target.value = "";
        clearObjectUrl();
        setImageFile(null);
        setImagePreview("");
        return;
      }

      setError(null);
      setImageFile(file);
      clearObjectUrl();
      const previewUrl = URL.createObjectURL(file);
      objectUrlRef.current = previewUrl;
      setImagePreview(previewUrl);
    },
    [clearObjectUrl]
  );

  const resetForm = useCallback(() => {
    setForm(INITIAL_FORM);
    setEditingId(null);
    clearObjectUrl();
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [clearObjectUrl]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setSaving(true);
      setError(null);

      try {
        let imageToUse = form.image;
        if (!editingId && !imageFile) throw new Error("Image is required.");
        if (imageFile) imageToUse = await fileToBase64(imageFile);

        const payload = {
          name: form.name.trim(),
          slug: form.slug.trim(),
          image: imageToUse,
          category: form.category.trim() || undefined,
          price: Number(form.price),
          stock: form.stock ? Number(form.stock) : undefined,
          badge: form.badge.trim() || undefined,
          discountType: form.discountType,
          discountValue: form.discountValue ? Number(form.discountValue) : 0,
          discountStartAt: form.discountStartAt || undefined,
          discountEndAt: form.discountEndAt || undefined,
        };

        if (!payload.name || !payload.slug || !payload.image || Number.isNaN(payload.price)) {
          throw new Error("Name, slug, image, and price are required.");
        }

        const url = editingId ? `/api/products/${editingId}` : "/api/products";
        const method = editingId ? "PUT" : "POST";

        const res = await fetch(url, {
          method,
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
              : "Failed to save product";
          throw new Error(message);
        }

        await loadProducts();
        resetForm();
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Unexpected error while saving product"));
      } finally {
        setSaving(false);
      }
    },
    [editingId, form, imageFile, loadProducts, resetForm]
  );

  const startEdit = useCallback(
    (product: Product) => {
      setEditingId(product._id);
      setForm({
        name: product.name || "",
        slug: product.slug || "",
        image: product.image || "",
        category: product.category || "",
        price: product.price != null ? String(product.price) : "",
        stock: product.stock != null ? String(product.stock) : "",
        badge: product.badge || "",
        discountType: product.discount?.type || "none",
        discountValue:
          typeof product.discount?.value === "number"
            ? String(product.discount.value)
            : "",
        discountStartAt: toInputDateTime(product.discount?.startAt),
        discountEndAt: toInputDateTime(product.discount?.endAt),
      });

      clearObjectUrl();
      setImageFile(null);
      setImagePreview(typeof product.image === "string" ? product.image : "");
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [clearObjectUrl]
  );

  const deleteProduct = useCallback(async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      setSaving(true);
      setError(null);
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
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
            : "Failed to delete product";
        throw new Error(message);
      }
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unexpected error while deleting product"));
    } finally {
      setSaving(false);
    }
  }, []);

  return (
    <main className="section-block">
      <div className="container">
        <div className="admin-header">
          <div className="admin-header-text">
            <h1 className="page-hero-title admin-title">Products</h1>
            <p className="page-hero-subtitle">Create, edit and manage your store catalog.</p>
          </div>
          <div className="admin-header-actions">
            <Link href="/store" className="btn btn-secondary">
              View Store
            </Link>
            <a href="#product-form" className="btn btn-primary">
              + Add Product
            </a>
          </div>
        </div>

        {error && <div className="admin-error-banner">{error}</div>}

        <div className="admin-products-layout">
          <section id="product-form" className="admin-form-card admin-products-form-panel">
            <div className="admin-form-header">
              <div>
                <h2 className="admin-form-title">{editingId ? "Edit Product" : "Create Product"}</h2>
                <p className="admin-form-subtitle">Quickly add or update products for your VALS store.</p>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary admin-cancel-btn"
                  disabled={saving}
                >
                  Cancel edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="admin-form-grid">
              <div className="form-field">
                <label className="form-label" htmlFor="name">Name</label>
                <input id="name" name="name" className="form-input" value={form.name} onChange={onChange} required disabled={saving} />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="slug">Slug</label>
                <input id="slug" name="slug" className="form-input" value={form.slug} onChange={onChange} placeholder="e.g. vals-basic-plan" required disabled={saving} />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="image">Product image (PNG/JPG/JPEG/WEBP)</label>
                <input
                  ref={fileInputRef}
                  id="image"
                  name="image"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="form-input"
                  onChange={handleImageChange}
                  required={isCreateMode}
                  disabled={saving}
                />
                {imagePreview && (
                  <div style={{ marginTop: 6, display: "flex", gap: 8, alignItems: "center" }}>
                    <Image
                      src={imagePreview}
                      alt="Selected product"
                      width={48}
                      height={48}
                      unoptimized
                      style={{ objectFit: "cover", borderRadius: 8, border: "1px solid rgba(148, 163, 184, 0.5)" }}
                    />
                    <p className="admin-form-subtitle" style={{ fontSize: "0.75rem", margin: 0 }}>
                      Image selected and ready to save.
                    </p>
                  </div>
                )}
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="category">Category</label>
                <input id="category" name="category" className="form-input" value={form.category} onChange={onChange} placeholder="e.g. subscription" disabled={saving} />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="price">Price (Rs)</label>
                <input id="price" name="price" type="number" min="0" step="0.01" className="form-input" value={form.price} onChange={onChange} required disabled={saving} />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="stock">Stock</label>
                <input id="stock" name="stock" type="number" min="0" step="1" className="form-input" value={form.stock} onChange={onChange} disabled={saving} />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="badge">Badge</label>
                <input id="badge" name="badge" className="form-input" value={form.badge} onChange={onChange} placeholder="e.g. Best Seller" disabled={saving} />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="discountType">Discount Type</label>
                <select
                  id="discountType"
                  name="discountType"
                  className="form-input"
                  value={form.discountType}
                  onChange={onChange}
                  disabled={saving}
                >
                  <option value="none">No Discount</option>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="discountValue">
                  Discount Value {form.discountType === "percentage" ? "(%)" : "(Rs)"}
                </label>
                <input
                  id="discountValue"
                  name="discountValue"
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input"
                  value={form.discountValue}
                  onChange={onChange}
                  disabled={saving || form.discountType === "none"}
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="discountStartAt">Discount Start</label>
                <input
                  id="discountStartAt"
                  name="discountStartAt"
                  type="datetime-local"
                  className="form-input"
                  value={form.discountStartAt}
                  onChange={onChange}
                  disabled={saving || form.discountType === "none"}
                />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="discountEndAt">Discount End</label>
                <input
                  id="discountEndAt"
                  name="discountEndAt"
                  type="datetime-local"
                  className="form-input"
                  value={form.discountEndAt}
                  onChange={onChange}
                  disabled={saving || form.discountType === "none"}
                />
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? (editingId ? "Saving..." : "Creating...") : editingId ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </section>

          <section className="admin-products-table-panel">
            <ProductTable
              products={products}
              loading={loading}
              showSlowLoadingHint={showSlowLoadingHint}
              saving={saving}
              totalProducts={products.length}
              onEdit={startEdit}
              onDelete={deleteProduct}
            />
          </section>
        </div>
      </div>
    </main>
  );
}

const ProductTable = memo(function ProductTable({
  products,
  loading,
  showSlowLoadingHint,
  saving,
  totalProducts,
  onEdit,
  onDelete,
}: {
  products: Product[];
  loading: boolean;
  showSlowLoadingHint: boolean;
  saving: boolean;
  totalProducts: number;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section>
      <div className="admin-table-header">
        <h2 className="admin-table-title">
          Products <span className="admin-count-pill">{totalProducts}</span>
        </h2>
        <span className="admin-table-subtitle">Latest added products</span>
      </div>

      <div className="admin-table-wrapper admin-table-scroll-5">
        {loading && products.length === 0 ? (
          <div className="admin-table-empty">
            {showSlowLoadingHint ? "Fetching latest products..." : ""}
          </div>
        ) : products.length === 0 ? (
          <table className="admin-table">
            <tbody>
              <tr>
                <td colSpan={10} className="admin-table-empty">
                  No products found.
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Category</th>
                <th>Price (Rs)</th>
                <th>Stock</th>
                <th>Badge</th>
                <th>Discount</th>
                <th>Created</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <Image
                      src={p.image}
                      alt={p.name}
                      width={40}
                      height={40}
                      unoptimized
                      style={{ objectFit: "cover", borderRadius: 8, border: "1px solid rgba(148, 163, 184, 0.5)" }}
                    />
                  </td>
                  <td>{p.name}</td>
                  <td>{p.slug}</td>
                  <td>{p.category}</td>
                  <td>{Number(p.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td>{p.stock ?? "-"}</td>
                  <td>{p.badge || "-"}</td>
                  <td>
                    {p.discount && p.discount.value > 0
                      ? p.discount.type === "percentage"
                        ? `${p.discount.value}%`
                        : `Rs ${Number(p.discount.value).toLocaleString()}`
                      : "-"}
                  </td>
                  <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}</td>
                  <td className="admin-table-actions">
                    <button onClick={() => onEdit(p)} disabled={saving} className="admin-action-btn admin-action-edit">
                      Edit
                    </button>
                    <button onClick={() => onDelete(p._id)} disabled={saving} className="admin-action-btn admin-action-delete">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
});
