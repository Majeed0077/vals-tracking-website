"use client";

import {
  useEffect,
  useState,
  useRef,
  type ChangeEvent,
  type FormEvent,
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

type FormState = {
  name: string;
  slug: string;
  image: string; // existing image (for edit)
  category: string;
  price: string;
  stock: string;
  badge: string;
};

const INITIAL_FORM: FormState = {
  name: "",
  slug: "",
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

export default function AdminDashboardPage() {
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

  // Derived stats
  const totalProducts = products.length;
  const totalStock = products.reduce(
    (sum, p) => sum + (p.stock ?? 0),
    0
  );
  // placeholders for now – orders system baad me add karenge
  const totalOrders = 0;
  const totalRevenue = 0;

  async function loadProducts() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/products", {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load products");
      }

      setProducts(data.products || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unexpected error while loading products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function onChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setImageFile(null);
      setImagePreview("");
      return;
    }

    // allow only png / jpg / jpeg / webp
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Only PNG, JPG, JPEG, or WEBP images are allowed.");
      e.target.value = "";
      setImageFile(null);
      setImagePreview("");
      return;
    }

    setError(null);
    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }

  function resetForm() {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setImageFile(null);
    setImagePreview("");

    // file input ko bhi clear karo (filename hide ho jayega)
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: FormEvent) {
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
        slug: form.slug.trim(),
        image: imageToUse,
        category: form.category.trim() || undefined,
        price: Number(form.price),
        stock: form.stock ? Number(form.stock) : undefined,
        badge: form.badge.trim() || undefined,
      };

      if (
        !payload.name ||
        !payload.slug ||
        !payload.image ||
        Number.isNaN(payload.price)
      ) {
        throw new Error("Name, slug, image, and price are required.");
      }

      const url = editingId ? `/api/products/${editingId}` : "/api/products";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save product");
      }

      await loadProducts();
      resetForm();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unexpected error while saving product");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(product: Product) {
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      slug: product.slug || "",
      image: product.image || "", // keep existing base64/URL
      category: product.category || "",
      price: product.price != null ? String(product.price) : "",
      stock: product.stock != null ? String(product.stock) : "",
      badge: product.badge || "",
    });

    setImageFile(null);
    if (typeof product.image === "string") {
      setImagePreview(product.image);
    } else {
      setImagePreview("");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;

    try {
      setSaving(true);
      setError(null);

      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete product");
      }

      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unexpected error while deleting product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="section-block">
      <div className="container">
        {/* Top heading + actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
            marginTop: 32,
          }}
        >
          <div>
            <h1 className="page-hero-title" style={{ marginBottom: 4 }}>
              Admin Dashboard
            </h1>
            <p className="page-hero-subtitle">
              Overview of your VALS store performance.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/store" className="btn">
              View Store
            </Link>
            <Link
              href="#product-form"
              className="btn btn-primary"
              style={{ borderRadius: 999 }}
            >
              + Add Product
            </Link>
          </div>
        </div>

        {/* Stats cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            marginBottom: 32,
          }}
        >
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
            <p className="admin-stat-sub">Orders tracking coming soon</p>
          </div>

          <div className="admin-stat-card">
            <p className="admin-stat-label">Total Revenue</p>
            <p className="admin-stat-value">
              Rs {totalRevenue.toLocaleString()}
            </p>
            <p className="admin-stat-sub">Connect checkout to enable</p>
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
                className="btn"
                style={{ fontSize: ".8rem", padding: "4px 10px" }}
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
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="slug">
                Slug
              </label>
              <input
                id="slug"
                name="slug"
                className="form-input"
                value={form.slug}
                onChange={onChange}
                placeholder="e.g. vals-basic-plan"
                required
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
              />
              {imagePreview && (
                <p
                  className="admin-form-subtitle"
                  style={{ marginTop: 4, fontSize: "0.75rem" }}
                >
                  Image selected – will be saved with this product.
                </p>
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
              />
            </div>

            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
              >
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

        {/* Products table */}
        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>
              Products ({totalProducts})
            </h2>
            <span style={{ fontSize: ".8rem", opacity: 0.75 }}>
              Latest added products
            </span>
          </div>

          <div className="admin-table-wrapper">
            {loading && products.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 24,
                  fontSize: ".9rem",
                  opacity: 0.7,
                }}
              >
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <table className="admin-table">
                <tbody>
                  <tr>
                    <td
                      colSpan={9}
                      style={{ textAlign: "center", padding: 24 }}
                    >
                      No products found. Use{" "}
                      <strong>“+ Add Product”</strong> to create one.
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
                    <th>Created</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <img
                          src={p.image}
                          alt={p.name}
                          style={{
                            width: 40,
                            height: 40,
                            objectFit: "cover",
                            borderRadius: 8,
                            border:
                              "1px solid rgba(148, 163, 184, 0.5)",
                          }}
                        />
                      </td>
                      <td>{p.name}</td>
                      <td>{p.slug}</td>
                      <td>{p.category}</td>
                      <td>
                        {Number(p.price).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td>{p.stock ?? "-"}</td>
                      <td>{p.badge || "-"}</td>
                      <td>
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => startEdit(p)}
                          style={{
                            fontSize: ".8rem",
                            marginRight: 8,
                            color: "#2563eb",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProduct(p._id)}
                          style={{
                            fontSize: ".8rem",
                            color: "#dc2626",
                          }}
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
      </div>
    </main>
  );
}
