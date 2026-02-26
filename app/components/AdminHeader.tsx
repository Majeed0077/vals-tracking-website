// app/components/AdminHeader.tsx
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  // ------------ THEME (same behavior as main Header) ------------
  const [theme, setTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("vals-theme") as
      | "light"
      | "dark"
      | null;

    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const initialTheme = stored ?? (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    router.prefetch("/store");
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("vals-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  // ------------ NAV ACTIVE HELPERS ------------
  const isActive = useCallback((href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  }, [pathname]);

  const handleLogout = useCallback(async () => {
    try {
      setLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setLoggingOut(false);
    }
  }, [router]);

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-top">
        <div className="admin-sidebar-brand">VALS Admin</div>
        <div className="admin-sidebar-role">Store Manager</div>
      </div>

      <nav className="admin-sidebar-nav">
        <Link href="/admin/dashboard" className={`admin-side-link${isActive("/admin/dashboard") ? " active" : ""}`}>
          Overview
        </Link>
        <Link href="/admin/products" className={`admin-side-link${isActive("/admin/products") ? " active" : ""}`}>
          Products
        </Link>
        <Link href="/admin/orders" className={`admin-side-link${isActive("/admin/orders") ? " active" : ""}`}>
          Orders
        </Link>
        <Link href="/admin/customers" className={`admin-side-link${isActive("/admin/customers") ? " active" : ""}`}>
          Customers
        </Link>
        <Link href="/admin/payments" className={`admin-side-link${isActive("/admin/payments") ? " active" : ""}`}>
          Payments
        </Link>
        <Link href="/admin/coupons" className={`admin-side-link${isActive("/admin/coupons") ? " active" : ""}`}>
          Coupons
        </Link>
        <Link href="/admin/reports" className={`admin-side-link${isActive("/admin/reports") ? " active" : ""}`}>
          Reports
        </Link>
        <Link href="/admin/notifications" className={`admin-side-link${isActive("/admin/notifications") ? " active" : ""}`}>
          Notifications
        </Link>
        <Link href="/admin/settings" className={`admin-side-link${isActive("/admin/settings") ? " active" : ""}`}>
          Settings
        </Link>
        <Link href="/admin/analytics" className={`admin-side-link${isActive("/admin/analytics") ? " active" : ""}`}>
          Analytics
        </Link>
      </nav>

      <div className="admin-sidebar-bottom">
        <Link href="/store" className="btn btn-secondary admin-side-store">
          View Store
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="nav-auth-btn login-btn admin-side-logout"
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
        <button
          type="button"
          className={`theme-switch ${theme === "dark" ? "theme-switch--on" : ""}`}
          onClick={toggleTheme}
          aria-label="Toggle dark/light theme"
          style={{ marginLeft: 0 }}
        >
          <span className="theme-switch-knob" />
        </button>
      </div>
    </aside>
  );
}
