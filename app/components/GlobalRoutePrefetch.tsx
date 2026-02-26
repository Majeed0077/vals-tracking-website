"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const WARMUP_ROUTES = [
  "/",
  "/store",
  "/store/cart",
  "/services",
  "/packages",
  "/about",
  "/contact",
  "/login",
  "/signup",
  "/account/settings",
  "/admin/dashboard",
  "/admin/products",
  "/admin/orders",
  "/admin/customers",
  "/admin/payments",
  "/admin/reports",
  "/admin/account",
];

function normalizeInternalHref(rawHref: string): string | null {
  if (!rawHref) return null;
  if (!rawHref.startsWith("/")) return null;
  if (rawHref.startsWith("//")) return null;
  if (rawHref.startsWith("/api")) return null;
  if (rawHref.startsWith("/_next")) return null;

  const hashIndex = rawHref.indexOf("#");
  const queryIndex = rawHref.indexOf("?");
  const cutAt =
    hashIndex === -1
      ? queryIndex
      : queryIndex === -1
        ? hashIndex
        : Math.min(hashIndex, queryIndex);

  return cutAt === -1 ? rawHref : rawHref.slice(0, cutAt);
}

export default function GlobalRoutePrefetch() {
  const router = useRouter();
  const pathname = usePathname();
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const prefetch = (href: string | null) => {
      if (!href || href === pathname) return;
      if (seenRef.current.has(href)) return;
      seenRef.current.add(href);
      router.prefetch(href);
    };

    for (const route of WARMUP_ROUTES) {
      prefetch(route);
    }

    const scanVisibleLinks = () => {
      const links = document.querySelectorAll<HTMLAnchorElement>("a[href]");
      let count = 0;

      for (const link of links) {
        if (count >= 60) break;
        const href = normalizeInternalHref(link.getAttribute("href") || "");
        if (!href) continue;
        prefetch(href);
        count += 1;
      }
    };

    scanVisibleLinks();

    const prefetchFromEvent = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = normalizeInternalHref(anchor.getAttribute("href") || "");
      prefetch(href);
    };

    document.addEventListener("mouseover", prefetchFromEvent, true);
    document.addEventListener("focusin", prefetchFromEvent, true);
    document.addEventListener("touchstart", prefetchFromEvent, true);

    return () => {
      document.removeEventListener("mouseover", prefetchFromEvent, true);
      document.removeEventListener("focusin", prefetchFromEvent, true);
      document.removeEventListener("touchstart", prefetchFromEvent, true);
    };
  }, [pathname, router]);

  return null;
}

