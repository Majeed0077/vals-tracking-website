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
    if (href === "/admin/dashboard") {
      return pathname === "/admin/dashboard";
    }
    if (href === "/admin/products") {
      return pathname === "/admin/products";
    }
    if (href === "/admin/orders") {
      return pathname === "/admin/orders";
    }
    if (href === "/admin/analytics") {
      return pathname === "/admin/analytics";
    }
    return pathname === href;
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
    <header className="header">
      <div className="container header-inner">
        {/* LEFT: title */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            VALS Admin
          </span>
          <span
            style={{
              fontSize: "0.8rem",
              opacity: 0.7,
            }}
          >
            Dashboard
          </span>
        </div>

        {/* CENTER: nav */}
        <nav className="nav">
          <Link
            href="/admin/dashboard"
            className={`nav-link${
              isActive("/admin/dashboard") ? " active" : ""
            }`}
          >
            Overview
          </Link>

          <Link
            href="/admin/products"
            className={`nav-link${isActive("/admin/products") ? " active" : ""}`}
          >
            Products
          </Link>

          <Link
            href="/admin/orders"
            className={`nav-link${isActive("/admin/orders") ? " active" : ""}`}
          >
            Orders
          </Link>

          <Link
            href="/admin/analytics"
            className={`nav-link${isActive("/admin/analytics") ? " active" : ""}`}
          >
            Analytics
          </Link>

          <Link href="/store" className="nav-link">
            View Store
          </Link>
        </nav>

        {/* RIGHT: user info + logout + theme switch */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ textAlign: "right", fontSize: "0.8rem" }}>
            <div style={{ fontWeight: 500 }}>Admin</div>
            <div style={{ opacity: 0.7 }}>Store Manager</div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="nav-auth-btn login-btn"
            style={{ borderRadius: 999, paddingInline: 16 }}
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>

          <button
            type="button"
            className={`theme-switch ${
              theme === "dark" ? "theme-switch--on" : ""
            }`}
            onClick={toggleTheme}
            aria-label="Toggle dark/light theme"
          >
            <span className="theme-switch-knob" />
          </button>
        </div>
      </div>
    </header>
  );
}
