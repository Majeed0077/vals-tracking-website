// app/components/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  // { href: "/login", label: "Login" },
];

export default function Header() {
  const pathname = usePathname();

  // THEME STATE
  const [theme, setTheme] = useState<"dark" | "light">("light");

  // Initialize theme from localStorage / system
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
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("vals-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // HEADER SCROLL EFFECT
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".header");
    if (!header) return;

    const handleScroll = () => {
      if (window.scrollY > 20) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="header">
      <div className="container header-inner">
        <div className="header-left">
          <Link href="/">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={160}
              height={48}
              className="logo"
            />
          </Link>
        </div>

        <div className="header-right">
          {/* Desktop nav (mobile is hidden via CSS) */}
          <nav className="nav">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <div key={item.href} className="nav-item-wrapper">
                  <Link
                    href={item.href}
                    className={`nav-link ${isActive ? "active" : ""}`}
                  >
                    {item.label}
                  </Link>

                  {item.mega && (
                    <div className="mega-menu">
                      <div className="mega-inner">
                        {item.columns.map((col, index) => (
                          <div className="mega-col" key={index}>
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

            {/* THEME TOGGLE BUTTON HERE (AFTER CONTACT) */}
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle dark/light theme"
            >
              <span className="theme-toggle-icon">
                {theme === "dark" ? "☀️" : "🌙"}
              </span>
              <span className="theme-toggle-label">
                {theme === "dark" ? "Light" : "Dark"}
              </span>
            </button>
          </nav>

        </div>
      </div>
    </header>
  );
}
