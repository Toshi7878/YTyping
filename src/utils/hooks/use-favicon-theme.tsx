"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect } from "react";

export function applyFavicon(cacheKey: string) {
  if (typeof document === "undefined") return;
  const href = `/favicons/favicon-${cacheKey}.ico`;

  const withCacheBust = cacheKey ? `${href}?t=${encodeURIComponent(cacheKey)}` : href;
  const id = "dynamic-favicon";
  let link = document.getElementById(id) as HTMLLinkElement | null;

  if (!link) {
    link = document.createElement("link");
    link.id = id;
    link.rel = "icon";
    link.type = "image/x-icon";
    document.head.append(link);
  }

  link.href = withCacheBust;
}

export function useFaviconTheme() {
  const { theme, resolvedTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    const active = theme === "system" ? resolvedTheme : theme;
    if (!active) return;

    applyFavicon(active);
  }, [theme, resolvedTheme, pathname]);
}
