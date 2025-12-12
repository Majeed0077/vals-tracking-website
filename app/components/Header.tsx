// app/components/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  {
    href: "/services",
    label: "Services",
    mega: true,
    columns: [
      {
        heading: "TRACKING SOLUTION",
        links: [
          { href: "/services/vehicle-tracking", label: "Vehicle Tracking System" },
          { href: "/services/fleet-management", label: "Fleet Management System" },
          { href: "/services/cold-chain", label: "Cold Chain Management" },
          { href: "/services/asset-tracking", label: "Asset Tracking" },
        ],
      },
      {
        heading: "LIQUID AND SOLID MONITORING SOLUTION",
        links: [
          { href: "/services/fuel-monitoring", label: "Vehicle Fuel Monitoring" },
          { href: "/services/genset-monitoring", label: "Genset Monitoring" },
          { href: "/services/filling-station", label: "Filling Station Monitoring" },
          { href: "/services/solid-chemical", label: "Solid Chemical Monitoring" },
        ],
      },
      {
        heading: "MDVR & NAVIGATION",
        links: [
          { href: "/services/dash-cam", label: "Dash Cam" },
          { href: "/services/dispatch", label: "Dispatch Services" },
          { href: "/services/mdvr", label: "MDVR Solutions" },
        ],
      },
      {
        heading: "PERSONNEL TRACKING SOLUTION",
        links: [
          { href: "/services/personal-tracking", label: "Personal Mobile Tracking" },
          { href: "/services/workforce-management", label: "Mobile Workforce Management" },
        ],
      },
    ],
  },
  { href: "/packages", label: "Packages" },
  { href: "/store", label: "Store" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

type UserRole = "admin" | "user" | null;

type AuthState = {
  checked: boolean;
  loggedIn: boolean;
  role: UserRole;
};

// ✅ Type-safe union for /api/auth/me responses (old + new supported)
type MeApiResponse =
  | { loggedIn?: boolean; role?: UserRole; email?: string | null; userId?: string | null }
  | { authenticated?: boolean; user?: { role?: UserRole } };

function normalizeMeResponse(
  data: MeApiResponse
): { loggedIn: boolean; role: UserRole } {
  // supports: { loggedIn: true, role: "admin" | "user" }
  if ("loggedIn" in data && typeof data.loggedIn === "boolean") {
    return {
      loggedIn: data.loggedIn,
      role: data.role ?? null,
    };
  }

  // supports: { authenticated: true, user: { role: ... } }
  if ("authenticated" in data && typeof data.authenticated === "boolean") {
    return {
      loggedIn: data.authenticated,
      role: data.user?.role ?? null,
    };
  }

  return { loggedIn: false, role: null };
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  // ---------------- THEME STATE (your existing logic) ----------------
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
    if (typeof window === "undefined") return;

    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("vals-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // ---------------- HEADER SCROLL EFFECT (your existing logic) ----------------
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".header");
    if (!header) return;

    const handleScroll = () => {
      if (window.scrollY > 20) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ---------------- AUTH STATE (from /api/auth/me) ----------------
  const [auth, setAuth] = useState<AuthState>({
    checked: false,
    loggedIn: false,
    role: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });

        const data = (await res.json().catch(() => ({}))) as MeApiResponse;
        const normalized = normalizeMeResponse(data);

        if (cancelled) return;

        setAuth({
          checked: true,
          loggedIn: !!normalized.loggedIn,
          role: normalized.role ?? null,
        });
      } catch {
        if (cancelled) return;
        setAuth({ checked: true, loggedIn: false, role: null });
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setAuth({ checked: true, loggedIn: false, role: null });
      router.push("/");
      router.refresh();
    }
  }

  // ---------------- DYNAMIC LOGO ----------------
  const logoSrc =
    theme === "dark" ? "/images/logo-light.png" : "/images/logo-dark.png";

  return (
    <header className="header">
      <div className="container header-inner">
        <div className="header-left">
          <Link href="/" className="logo-wrap">
            <Image src={logoSrc} alt="Logo" width={1600} height={50} className="logo" />
          </Link>
        </div>

        <div className="header-right">
          <nav className="nav">
            {navItems.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <div key={item.href} className="nav-item-wrapper">
                  <Link href={item.href} className={`nav-link ${isActive ? "active" : ""}`}>
                    {item.label}
                  </Link>

                  {item.mega && (
                    <div className="mega-menu">
                      <div className="mega-inner">
                        {item.columns?.map((col, index) => (
                          <div key={index} className="mega-col">
                            <h4>{col.heading}</h4>
                            <ul>
                              {col.links.map((link) => (
                                <li key={link.href}>
                                  <Link href={link.href}>{link.label}</Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* AUTH AREA (dynamic) */}
            {auth.checked && !auth.loggedIn && (
              <div className="auth-buttons">
                <Link href="/login" className="nav-auth-btn login-btn">
                  Login
                </Link>
                <Link href="/signup" className="nav-auth-btn signup-btn">
                  Signup
                </Link>
              </div>
            )}

            {auth.checked && auth.loggedIn && (
              <div className="auth-buttons">
                {auth.role === "admin" && (
                  <Link href="/admin/dashboard" className="nav-auth-btn login-btn">
                    Dashboard
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="nav-auth-btn signup-btn"
                  style={{ borderRadius: 999 }}
                >
                  Logout
                </button>
              </div>
            )}

            {/* Theme switch */}
            <button
              type="button"
              className={`theme-switch ${theme === "dark" ? "theme-switch--on" : ""}`}
              onClick={toggleTheme}
              aria-label="Toggle dark/light theme"
            >
              <span className="theme-switch-knob" />
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
