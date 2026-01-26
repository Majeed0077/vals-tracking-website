// app/admin/dashboard/page.tsx
"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

type FormState = {
  name: string;
  image: string; // existing image (for edit)
  category: string;
  price: string;
  stock: string;
  badge: string;
};

const INITIAL_FORM: FormState = {
  name: "",
  image: "",
  category: "",
  price: "",
  stock: "",
  badge: "",
};

// helper: file -> base64 (data URL)
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = () => {
      reject(reader.error || new Error("Failed to read file"));
    };
    reader.readAsDataURL(file);
  });
}

// helper: unknown -> message (no any)
function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  // image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // file input ref (to clear chosen filename)
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Derived stats
  const { totalProducts, totalStock } = useMemo(() => {
    return {
      totalProducts: products.length,
      totalStock: products.reduce((sum, p) => sum + (p.stock ?? 0), 0),
    };
  }, [products]);

  const totalOrders = 0;
  const totalRevenue = 0;

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
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    loadProducts();
  }, [loadProducts]);


  useEffect(() => {
    router.prefetch("/store");
  }, [router]);

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const handleImageChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;

      if (!file) {
        clearObjectUrl();
        setImageFile(null);
        setImagePreview("");
        return;
      }

      // allow only png / jpg / jpeg / webp
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

    // file input ko bhi clear karo (filename hide ho jayega)
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [clearObjectUrl]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setSaving(true);
      setError(null);

      try {
        // decide which image to send
        let imageToUse = form.image;

        // create mode: image is mandatory
        if (!editingId && !imageFile) {
          throw new Error("Image is required.");
        }

        // if new file selected (create or edit), convert to base64
        if (imageFile) {
          imageToUse = await fileToBase64(imageFile);
        }

        const payload = {
          name: form.name.trim(),
          image: imageToUse,
          category: form.category.trim() || undefined,
          price: Number(form.price),
          stock: form.stock ? Number(form.stock) : undefined,
          badge: form.badge.trim() || undefined,
        };

        if (
          !payload.name ||
          !payload.image ||
          Number.isNaN(payload.price)
        ) {
          throw new Error("Name, image, and price are required.");
        }

        if (payload.price < 0) {
          throw new Error("Price cannot be negative.");
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
        console.error(err);
        setError(getErrorMessage(err, "Unexpected error while saving product"));
      } finally {
        setSaving(false);
      }
    },
    [editingId, form, imageFile, loadProducts, resetForm]
  );

  const startEdit = useCallback((product: Product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      image: product.image || "", // keep existing base64/URL
      category: product.category || "",
      price: product.price != null ? String(product.price) : "",
      stock: product.stock != null ? String(product.stock) : "",
      badge: product.badge || "",
    });

    clearObjectUrl();
    setImageFile(null);
    if (typeof product.image === "string") {
      setImagePreview(product.image);
    } else {
      setImagePreview("");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [clearObjectUrl]);

  useEffect(() => {
    return () => {
      clearObjectUrl();
    };
  }, [clearObjectUrl]);

  const deleteProduct = useCallback(async (id: string) => {
    if (!confirm("Delete this product?")) return;

    try {
      setSaving(true);
      setError(null);

      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
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
            : "Failed to delete product";
        throw new Error(message);
      }

      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err, "Unexpected error while deleting product"));
    } finally {
      setSaving(false);
    }
  }, []);


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
            <Link
              href="#product-form"
              className="btn btn-primary"
            >
              + Add Product
            </Link>
          </div>
        </div>

        {/* Stats cards */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <p className="admin-stat-label">Total Products</p>
            <p className="admin-stat-value">{totalProducts}</p>
          </div>

          <div className="admin-stat-card">
            <p className="admin-stat-label">Total Stock</p>
            <p className="admin-stat-value">{totalStock}</p>
          </div>

          <div className="admin-stat-card">
            <p className="admin-stat-label">Total Orders</p>
            <p className="admin-stat-value">{totalOrders}</p>
            <p className="admin-stat-sub">See Orders page</p>
          </div>

          <div className="admin-stat-card">
            <p className="admin-stat-label">Total Revenue</p>
            <p className="admin-stat-value">Rs {totalRevenue.toLocaleString()}</p>
            <p className="admin-stat-sub">View in Orders page</p>
          </div>
        </div>

        {/* Error banner */}
        {error && <div className="admin-error-banner">{error}</div>}

        {/* Product form (Create / Edit) */}
        <section id="product-form" className="admin-form-card">
          <div className="admin-form-header">
            <div>
              <h2 className="admin-form-title">
                {editingId ? "Edit Product" : "Create Product"}
              </h2>
              <p className="admin-form-subtitle">
                Quickly add or update products for your VALS store.
              </p>
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
              <label className="form-label" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                name="name"
                className="form-input"
                value={form.name}
                onChange={onChange}
                required
                disabled={saving}
              />
            </div>

            {/* Image upload */}
            <div className="form-field">
              <label className="form-label" htmlFor="image">
                Product image (PNG/JPG/JPEG/WEBP)
              </label>
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
                    style={{
                      objectFit: "cover",
                      borderRadius: 8,
                      border: "1px solid rgba(148, 163, 184, 0.5)",
                    }}
                  />
                  <p className="admin-form-subtitle" style={{ fontSize: "0.75rem", margin: 0 }}>
                    Image selected – will be saved with this product.
                  </p>
                </div>
              )}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="category">
                Category
              </label>
              <input
                id="category"
                name="category"
                className="form-input"
                value={form.category}
                onChange={onChange}
                placeholder="e.g. subscription"
                disabled={saving}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="price">
                Price (Rs)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                className="form-input"
                value={form.price}
                onChange={onChange}
                required
                disabled={saving}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="stock">
                Stock
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                className="form-input"
                value={form.stock}
                onChange={onChange}
                disabled={saving}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="badge">
                Badge
              </label>
              <input
                id="badge"
                name="badge"
                className="form-input"
                value={form.badge}
                onChange={onChange}
                placeholder="e.g. Best Seller"
                disabled={saving}
              />
            </div>

            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving
                  ? editingId
                    ? "Saving..."
                    : "Creating..."
                  : editingId
                    ? "Save Changes"
                    : "Create Product"}
              </button>
            </div>
          </form>
        </section>

        <ProductTable
          products={products}
          loading={loading}
          saving={saving}
          totalProducts={totalProducts}
          onEdit={startEdit}
          onDelete={deleteProduct}
        />
      </div>
    </main>
  );
}

const ProductTable = memo(function ProductTable({
  products,
  loading,
  saving,
  totalProducts,
  onEdit,
  onDelete,
}: {
  products: Product[];
  loading: boolean;
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
        <span className="admin-table-subtitle">
          Latest added products
        </span>
      </div>

      <div className="admin-table-wrapper">
        {loading && products.length === 0 ? (
          <div className="admin-table-empty">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <table className="admin-table">
            <tbody>
              <tr>
                <td colSpan={8} className="admin-table-empty">
                  No products found. Use <strong>"+ Add Product"</strong> to
                  create one.
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
                <th>Category</th>
                <th>Price (Rs)</th>
                <th>Stock</th>
                <th>Badge</th>
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
                      style={{
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid rgba(148, 163, 184, 0.5)",
                      }}
                    />
                  </td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>
                    {Number(p.price).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td>{p.stock ?? "-"}</td>
                  <td>{p.badge || "-"}</td>
                  <td>
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}
                  </td>
                  <td className="admin-table-actions">
                    <button
                      onClick={() => onEdit(p)}
                      disabled={saving}
                      className="admin-action-btn admin-action-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(p._id)}
                      disabled={saving}
                      className="admin-action-btn admin-action-delete"
                    >
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

