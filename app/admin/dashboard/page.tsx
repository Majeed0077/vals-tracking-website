import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

// Prevent static generation (important for Netlify + DB queries)
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await connectDB();

  const products = await Product.find().lean();

  const totalProducts = products.length;
  const totalStock = products.reduce(
    (sum: number, p: any) => sum + (p.stock || 0),
    0
  );

  // placeholders for now – orders system baad me add karenge
  const totalOrders = 0;
  const totalRevenue = 0;

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
              href="/admin/products/new"
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
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Category</th>
                  <th>Price (Rs)</th>
                  <th>Stock</th>
                  <th>Badge</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: 24 }}>
                      No products found. Use{" "}
                      <strong>“+ Add Product”</strong> to create one.
                    </td>
                  </tr>
                ) : (
                  products.map((p: any) => (
                    <tr key={p._id.toString()}>
                      <td>{p.name}</td>
                      <td>{p.slug}</td>
                      <td>{p.category}</td>
                      <td>
                        {typeof p.price === "number"
                          ? p.price.toLocaleString()
                          : p.price}
                      </td>
                      <td>{p.stock ?? "-"}</td>
                      <td>{p.badge || "-"}</td>
                      <td>
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
