// app/components/AdminHeader.tsx
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: "overview" | "products" | "orders" | "customers" | "payments" | "coupons" | "reports" | "notifications" | "settings" | "analytics" | "account";
};

function SidebarIcon({ icon }: { icon: NavItem["icon"] | "store" | "logout" | "collapse" | "expand" }) {
  const common = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (icon) {
    case "overview":
      return <svg {...common}><rect x="3" y="3" width="8" height="8" /><rect x="13" y="3" width="8" height="5" /><rect x="13" y="10" width="8" height="11" /><rect x="3" y="13" width="8" height="8" /></svg>;
    case "products":
      return <svg {...common}><path d="M21 8a2 2 0 0 0-1.1-1.8l-7-3.5a2 2 0 0 0-1.8 0l-7 3.5A2 2 0 0 0 3 8v8a2 2 0 0 0 1.1 1.8l7 3.5a2 2 0 0 0 1.8 0l7-3.5A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 4.5L20.7 7" /><path d="M12 22V11.5" /></svg>;
    case "orders":
      return <svg {...common}><path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" /><path d="M3 6h.01" /><path d="M3 12h.01" /><path d="M3 18h.01" /></svg>;
    case "customers":
      return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case "payments":
      return <svg {...common}><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /><path d="M7 15h3" /></svg>;
    case "coupons":
      return <svg {...common}><path d="M21 7.5V6a2 2 0 0 0-2-2h-3.5a2 2 0 0 1 0 4H19a2 2 0 0 0 2-2Z" /><path d="M3 7.5V6a2 2 0 0 1 2-2h3.5a2 2 0 0 0 0 4H5a2 2 0 0 1-2-2Z" /><path d="M21 16.5V18a2 2 0 0 1-2 2h-3.5a2 2 0 0 0 0-4H19a2 2 0 0 1 2 2Z" /><path d="M3 16.5V18a2 2 0 0 0 2 2h3.5a2 2 0 0 1 0-4H5a2 2 0 0 0-2 2Z" /><path d="M12 4v16" /></svg>;
    case "reports":
      return <svg {...common}><path d="M3 3v18h18" /><path d="m7 14 4-4 3 3 5-6" /></svg>;
    case "notifications":
      return <svg {...common}><path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" /><path d="M9 17a3 3 0 0 0 6 0" /></svg>;
    case "settings":
      return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1.1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1Z" /></svg>;
    case "analytics":
      return <svg {...common}><path d="M4 19h16" /><path d="M7 19V9" /><path d="M12 19V5" /><path d="M17 19v-7" /></svg>;
    case "account":
      return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
    case "store":
      return <svg {...common}><path d="M3 9h18l-1 11H4L3 9Z" /><path d="M8 9V6a4 4 0 1 1 8 0v3" /></svg>;
    case "logout":
      return <svg {...common}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>;
    case "collapse":
      return <svg {...common}><path d="m15 18-6-6 6-6" /></svg>;
    case "expand":
      return <svg {...common}><path d="m9 18 6-6-6-6" /></svg>;
    default:
      return null;
  }
}

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // ------------ THEME (same behavior as main Header) ------------
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [themeLoaded, setThemeLoaded] = useState(false);

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
    document.documentElement.setAttribute("data-theme", initialTheme);
    setTheme(initialTheme);
    setThemeLoaded(true);
  }, []);

  useEffect(() => {
    router.prefetch("/store");
  }, [router]);

  useEffect(() => {
    const adminRoutes = [
      "/admin/dashboard",
      "/admin/products",
      "/admin/orders",
      "/admin/customers",
      "/admin/payments",
      "/admin/coupons",
      "/admin/reports",
      "/admin/notifications",
      "/admin/settings",
      "/admin/analytics",
      "/admin/account",
    ];

    for (const route of adminRoutes) {
      router.prefetch(route);
    }
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined" || !themeLoaded) return;
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("vals-theme", theme);
  }, [theme, themeLoaded]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("vals-admin-sidebar-collapsed");
    const isCollapsed = stored === "1";
    setCollapsed(isCollapsed);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.style.setProperty("--admin-sidebar-width", collapsed ? "88px" : "250px");
    window.localStorage.setItem("vals-admin-sidebar-collapsed", collapsed ? "1" : "0");
    return () => {
      document.documentElement.style.removeProperty("--admin-sidebar-width");
    };
  }, [collapsed]);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  // ------------ NAV ACTIVE HELPERS ------------
  const isActive = useCallback((href: string) => {
    if (pendingHref === href) return true;
    return pathname === href || pathname.startsWith(`${href}/`);
  }, [pathname, pendingHref]);

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

  const navItems: NavItem[] = [
    { href: "/admin/dashboard", label: "Overview", icon: "overview" },
    { href: "/admin/products", label: "Products", icon: "products" },
    { href: "/admin/orders", label: "Orders", icon: "orders" },
    { href: "/admin/customers", label: "Customers", icon: "customers" },
    { href: "/admin/payments", label: "Payments", icon: "payments" },
    { href: "/admin/coupons", label: "Coupons", icon: "coupons" },
    { href: "/admin/reports", label: "Reports", icon: "reports" },
    { href: "/admin/notifications", label: "Notifications", icon: "notifications" },
    { href: "/admin/settings", label: "Store Settings", icon: "settings" },
    { href: "/admin/analytics", label: "Analytics", icon: "analytics" },
    { href: "/admin/account", label: "My Account", icon: "account" },
  ];

  return (
    <aside className={`admin-sidebar${collapsed ? " is-collapsed" : ""}`}>
      <div className="admin-sidebar-top">
        <div className="admin-sidebar-head">
          <div className="admin-sidebar-brand-wrap">
            <div className="admin-sidebar-identity">
              <div className="admin-sidebar-brand">VALS Admin</div>
              <div className="admin-sidebar-role">Store Manager</div>
            </div>
          </div>
          <div className="admin-sidebar-controls">
            {!collapsed && (
              <button
                type="button"
                className={`theme-switch ${theme === "dark" ? "theme-switch--on" : ""}`}
                onClick={toggleTheme}
                aria-label="Toggle dark/light theme"
                title="Toggle theme"
              >
                <span className="theme-switch-knob" />
              </button>
            )}
          </div>
        </div>
      </div>

      <nav className="admin-sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`admin-side-link${isActive(item.href) ? " active" : ""}`}
            title={collapsed ? item.label : undefined}
            onMouseEnter={() => router.prefetch(item.href)}
            onFocus={() => router.prefetch(item.href)}
            onClick={() => setPendingHref(item.href)}
          >
            <span className="admin-side-link-icon"><SidebarIcon icon={item.icon} /></span>
            <span className="admin-side-link-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <button
        type="button"
        className="admin-sidebar-collapse-handle"
        onClick={() => setCollapsed((prev) => !prev)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <SidebarIcon icon={collapsed ? "expand" : "collapse"} />
      </button>

      <div className="admin-sidebar-bottom">
        <Link href="/store" className="btn btn-secondary admin-side-store" title={collapsed ? "View Store" : undefined}>
          <span className="admin-side-link-icon"><SidebarIcon icon="store" /></span>
          <span className="admin-side-link-label">View Store</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="btn btn-secondary admin-side-logout"
          title={collapsed ? "Logout" : undefined}
        >
          <span className="admin-side-link-icon"><SidebarIcon icon="logout" /></span>
          <span className="admin-side-link-label">{loggingOut ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
}
