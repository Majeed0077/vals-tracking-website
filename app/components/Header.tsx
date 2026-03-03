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
    intro: "Choose a solution stack tailored for your fleet operations.",
    columns: [
      {
        heading: "TRACKING SOLUTION",
        description: "Vehicle and asset visibility in real-time",
        links: [
          { href: "/services/vehicle-tracking", label: "Vehicle Tracking System", icon: "vehicle" },
          { href: "/services/fleet-management", label: "Fleet Management System", icon: "fleet" },
          { href: "/services/cold-chain", label: "Cold Chain Management", icon: "cold" },
          { href: "/services/asset-tracking", label: "Asset Tracking", icon: "asset" },
        ],
      },
      {
        heading: "LIQUID AND SOLID MONITORING SOLUTION",
        description: "Monitor fuel, gensets and industrial inventory",
        links: [
          { href: "/services/fuel-monitoring", label: "Vehicle Fuel Monitoring", icon: "fuel" },
          { href: "/services/genset-monitoring", label: "Genset Monitoring", icon: "power" },
          { href: "/services/filling-station", label: "Filling Station Monitoring", icon: "station" },
          { href: "/services/solid-chemical", label: "Solid Chemical Monitoring", icon: "chemical" },
        ],
      },
      {
        heading: "MDVR & NAVIGATION",
        description: "Surveillance, dispatch and route command",
        links: [
          { href: "/services/dash-cam", label: "Dash Cam", icon: "camera" },
          { href: "/services/dispatch", label: "Dispatch Services", icon: "dispatch" },
          { href: "/services/mdvr", label: "MDVR Solutions", icon: "mdvr" },
        ],
      },
      {
        heading: "PERSONNEL TRACKING SOLUTION",
        description: "Workforce movement and team-level tracking",
        links: [
          { href: "/services/personal-tracking", label: "Personal Mobile Tracking", icon: "person" },
          { href: "/services/workforce-management", label: "Mobile Workforce Management", icon: "team" },
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
  userId?: string | null;
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
  userId: string | null;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
} {
  // supports: { loggedIn: true, role: "admin" | "user" }
  if ("loggedIn" in data && typeof data.loggedIn === "boolean") {
    return {
      loggedIn: data.loggedIn,
      role: data.role ?? null,
      userId: data.userId ?? null,
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
      userId: null,
      email: null,
      name: null,
      avatarUrl: null,
    };
  }

  return { loggedIn: false, role: null, userId: null, email: null, name: null, avatarUrl: null };
}

function MegaBrandIcon({ icon }: { icon?: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (icon) {
    case "vehicle":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M3.8 13.2h16.4v4.5H3.8zM6.4 8.2h11.2l2.2 3H4.2l2.2-3z" />
          <circle {...common} cx="8" cy="17.8" r="1.3" />
          <circle {...common} cx="16" cy="17.8" r="1.3" />
          <path {...common} d="M8.8 10.5h6.4" />
        </svg>
      );
    case "fleet":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect {...common} x="3.8" y="4.4" width="8.8" height="5.6" rx="1.2" />
          <rect {...common} x="14.2" y="4.4" width="6" height="5.6" rx="1.2" />
          <rect {...common} x="3.8" y="12.2" width="16.4" height="7.4" rx="1.2" />
          <path {...common} d="M8 15.8h8" />
        </svg>
      );
    case "cold":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M12 3.2v17.6M4 12h16M6.6 6.6l10.8 10.8M17.4 6.6 6.6 17.4" />
          <circle {...common} cx="12" cy="12" r="2.4" />
        </svg>
      );
    case "asset":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="m12 3.2 8 4.2v9.2L12 20.8 4 16.6V7.4z" />
          <path {...common} d="M12 3.2v17.6M20 7.4 12 12 4 7.4" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" />
        </svg>
      );
    case "fuel":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect {...common} x="6.2" y="4" width="7.2" height="16" rx="1.1" />
          <path {...common} d="M13.4 7h3.4l1.8 2.2V16a2 2 0 1 1-4 0v-2.4" />
          <path {...common} d="M8.2 8.2h3.2" />
        </svg>
      );
    case "power":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M12 3.4v6.4M16.2 6.4a7 7 0 1 1-8.4 0" />
          <circle cx="12" cy="13.5" r="1.2" fill="currentColor" />
        </svg>
      );
    case "station":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect {...common} x="5.8" y="4" width="8.2" height="16" rx="1.1" />
          <path {...common} d="M14 8.2h3l1.2 2v8.1a2 2 0 1 1-4 0V16" />
          <path {...common} d="M8 8h3.8M8 11h3.8" />
        </svg>
      );
    case "chemical":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M9 3.5h6M10 3.5v4.8l-4.8 7.7a3.8 3.8 0 0 0 3.2 5.8h7.2a3.8 3.8 0 0 0 3.2-5.8L14 8.3V3.5" />
          <path {...common} d="M8.2 14h7.6" />
        </svg>
      );
    case "camera":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect {...common} x="3.8" y="8" width="16.4" height="10.2" rx="1.2" />
          <path {...common} d="M7.2 8 8.4 5.2h7.2L16.8 8" />
          <circle {...common} cx="12" cy="13.1" r="2.2" />
        </svg>
      );
    case "dispatch":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M3.5 12h17M8.2 7.3 3.6 12l4.6 4.7m7.6-9.4L20.4 12l-4.6 4.7" />
          <circle cx="12" cy="12" r="1.1" fill="currentColor" />
        </svg>
      );
    case "mdvr":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect {...common} x="3.8" y="6" width="16.4" height="12" rx="1.2" />
          <path {...common} d="M7 8.3v7.4M10.7 8.3v7.4M14.4 8.3v7.4M18.1 8.3v7.4" />
        </svg>
      );
    case "person":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle {...common} cx="12" cy="8.2" r="3.5" />
          <path {...common} d="M5.2 20a6.8 6.8 0 0 1 13.6 0" />
        </svg>
      );
    case "team":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle {...common} cx="8.8" cy="8.5" r="2.8" />
          <circle {...common} cx="16.8" cy="8.7" r="2.5" />
          <path {...common} d="M3.2 19.8a5.7 5.7 0 0 1 11.3 0m1.5 0a5.2 5.2 0 0 1 5-4.2" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M4 12h16M12 4v16" />
        </svg>
      );
  }
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const cartCount = useShopStore((state) =>
    state.cart.reduce((sum, item) => sum + item.qty, 0)
  );
  const setShopScope = useShopStore((state) => state.setScope);

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
    userId: null,
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
          userId: normalized.userId ?? null,
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
          userId: null,
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
    if (!auth.checked) return;
    const scope = auth.loggedIn && auth.role && auth.userId
      ? `${auth.role}:${auth.userId}`
      : "guest";
    setShopScope(scope);
  }, [auth.checked, auth.loggedIn, auth.role, auth.userId, setShopScope]);

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
        userId: null,
        email: null,
        name: null,
        avatarUrl: null,
      });
      setShopScope("guest");
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
                      <div className="mega-shell">
                        <div className="mega-head">
                          <div>
                            <p className="mega-eyebrow">Service Catalog</p>
                            <h3 className="mega-title">Operations-ready modules for every fleet model</h3>
                            <p className="mega-intro">{item.intro}</p>
                          </div>
                          <Link href="/services" className="mega-view-all">
                            View all services
                          </Link>
                        </div>
                        <div className="mega-inner">
                        {item.columns?.map((col, index) => (
                          <div key={index} className="mega-col">
                            <h4>{col.heading}</h4>
                            <p className="mega-col-desc">{col.description}</p>
                            <ul>
                              {col.links.map((link) => (
                                <li key={link.href}>
                                  <Link href={link.href} className="mega-link-card">
                                    <span className="mega-link-icon" aria-hidden="true">
                                      <MegaBrandIcon icon={link.icon} />
                                    </span>
                                    <span className="mega-link-text">{link.label}</span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                        </div>
                        <div className="mega-foot">
                          <div className="mega-foot-stat">
                            <strong>24/7</strong>
                            <span>Monitoring Support</span>
                          </div>
                          <div className="mega-foot-stat">
                            <strong>5000+</strong>
                            <span>Active Devices</span>
                          </div>
                          <div className="mega-foot-stat">
                            <strong>45+</strong>
                            <span>Cities Covered</span>
                          </div>
                          <Link href="/contact" className="mega-consult-btn">
                            Book Consultation
                          </Link>
                        </div>
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
