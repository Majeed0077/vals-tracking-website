// app/components/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useShopStore } from "@/app/state/useShopStore";

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
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
};

// ✅ Type-safe union for /api/auth/me responses (old + new supported)
type MeApiResponse =
  | {
      loggedIn?: boolean;
      role?: UserRole;
      email?: string | null;
      userId?: string | null;
      user?: { role?: UserRole; name?: string | null; avatarUrl?: string | null };
    }
  | { authenticated?: boolean; user?: { role?: UserRole } };

function normalizeMeResponse(
  data: MeApiResponse
): {
  loggedIn: boolean;
  role: UserRole;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
} {
  // supports: { loggedIn: true, role: "admin" | "user" }
  if ("loggedIn" in data && typeof data.loggedIn === "boolean") {
    return {
      loggedIn: data.loggedIn,
      role: data.role ?? null,
      email: data.email ?? null,
      name: data.user?.name ?? null,
      avatarUrl: data.user?.avatarUrl ?? null,
    };
  }

  // supports: { authenticated: true, user: { role: ... } }
  if ("authenticated" in data && typeof data.authenticated === "boolean") {
    return {
      loggedIn: data.authenticated,
      role: data.user?.role ?? null,
      email: null,
      name: null,
      avatarUrl: null,
    };
  }

  return { loggedIn: false, role: null, email: null, name: null, avatarUrl: null };
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const cartCount = useShopStore((state) =>
    state.cart.reduce((sum, item) => sum + item.qty, 0)
  );

  // ---------------- THEME STATE (your existing logic) ----------------
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
    if (typeof window === "undefined" || !themeLoaded) return;

    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("vals-theme", theme);
  }, [theme, themeLoaded]);

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
    email: null,
    name: null,
    avatarUrl: null,
  });
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

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
          email: normalized.email ?? null,
          name: normalized.name ?? null,
          avatarUrl: normalized.avatarUrl ?? null,
        });
      } catch {
        if (cancelled) return;
        setAuth({
          checked: true,
          loggedIn: false,
          role: null,
          email: null,
          name: null,
          avatarUrl: null,
        });
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setActiveMega(null);
    setProfileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!profileMenuRef.current) return;
      if (!profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setAuth({
        checked: true,
        loggedIn: false,
        role: null,
        email: null,
        name: null,
        avatarUrl: null,
      });
      setProfileMenuOpen(false);
      router.push("/");
      router.refresh();
    }
  }

  const profileInitial =
    auth.name?.trim().charAt(0).toUpperCase() ||
    auth.email?.trim().charAt(0).toUpperCase() ||
    "U";
  const settingsHref = auth.role === "admin" ? "/admin/account" : "/account/settings";

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
          <nav className="nav nav-desktop">
            {navItems.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <div
                  key={item.href}
                  className={`nav-item-wrapper${item.mega ? " nav-item-wrapper--mega" : ""}`}
                  onMouseEnter={() => item.mega && setActiveMega(item.href)}
                  onMouseLeave={() => item.mega && setActiveMega(null)}
                >
                  <Link
                    href={item.href}
                    className={`nav-link ${isActive ? "active" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                    aria-haspopup={item.mega ? "true" : undefined}
                    aria-expanded={item.mega ? activeMega === item.href : undefined}
                  >
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

            <Link href="/store/cart" className="nav-cart-btn">
              <span className="nav-cart-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path
                    d="M6 6h14l-2 8H8L6 6Zm0 0-1-3H2m6 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              Cart ({cartCount})
            </Link>

            {/* AUTH AREA (dynamic) */}
            {!auth.checked && <span className="nav-loading">Checking...</span>}
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
                <div className="profile-menu-wrap" ref={profileMenuRef}>
                  <button
                    type="button"
                    className="profile-trigger"
                    onClick={() => setProfileMenuOpen((prev) => !prev)}
                  >
                    {auth.avatarUrl ? (
                      <Image
                        src={auth.avatarUrl}
                        alt="Profile"
                        width={28}
                        height={28}
                        unoptimized
                        className="profile-avatar"
                      />
                    ) : (
                      <span className="profile-avatar profile-avatar-fallback">{profileInitial}</span>
                    )}
                    <span className="profile-name">{auth.name || "My Account"}</span>
                  </button>

                  {profileMenuOpen && (
                    <div className="profile-dropdown">
                      {auth.role === "admin" && (
                        <Link href="/admin/dashboard" className="profile-dropdown-link">
                          Admin Dashboard
                        </Link>
                      )}
                      <Link href={settingsHref} className="profile-dropdown-link">
                        Settings
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="profile-dropdown-link profile-dropdown-danger"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
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

          <div className="nav-actions">
            <button
              type="button"
              className={`theme-switch mobile-theme-toggle ${
                theme === "dark" ? "theme-switch--on" : ""
              }`}
              onClick={toggleTheme}
              aria-label="Toggle dark/light theme"
            >
              <span className="theme-switch-knob" />
            </button>
            <button
              type="button"
              className="nav-toggle"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              <span className="nav-toggle-bar" />
              <span className="nav-toggle-bar" />
              <span className="nav-toggle-bar" />
            </button>
          </div>
        </div>
      </div>

      <div id="mobile-menu" className={`mobile-menu ${mobileOpen ? "open" : ""}`}>
        <div className="container mobile-menu-inner">
          <div className="mobile-nav">
            {navItems.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              if (item.mega) {
                return (
                  <details key={item.href} className="mobile-nav-item">
                    <summary className="mobile-nav-link">
                      {item.label}
                    </summary>
                    <div className="mobile-mega">
                      {item.columns?.map((col) => (
                        <div key={col.heading} className="mobile-mega-col">
                          <span className="mobile-mega-title">{col.heading}</span>
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
                  </details>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mobile-nav-link ${isActive ? "active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="mobile-auth">
            {!auth.checked && <span className="nav-loading">Checking...</span>}
            {auth.checked && !auth.loggedIn && (
              <div className="auth-buttons">
                <Link href="/store/cart" className="nav-cart-btn">
                  <span className="nav-cart-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path
                        d="M6 6h14l-2 8H8L6 6Zm0 0-1-3H2m6 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  Cart ({cartCount})
                </Link>
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
                <Link href={settingsHref} className="nav-auth-btn login-btn">
                  Settings
                </Link>
                <Link href="/store/cart" className="nav-cart-btn">
                  <span className="nav-cart-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path
                        d="M6 6h14l-2 8H8L6 6Zm0 0-1-3H2m6 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  Cart ({cartCount})
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="nav-auth-btn signup-btn"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
