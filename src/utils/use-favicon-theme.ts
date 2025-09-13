"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function applyFavicon(href: string, cacheKey?: string) {
  if (typeof document === "undefined") return;

  const links = document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]');
  const withCacheBust = cacheKey ? `${href}?t=${encodeURIComponent(cacheKey)}` : href;

  if (links.length === 0) {
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/x-icon";
    link.href = withCacheBust;
    document.head.appendChild(link);
    return;
  }

  links.forEach((link) => {
    link.type = "image/x-icon";
    link.href = withCacheBust;
  });
}

export function useFaviconTheme() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) return;
    const href = `/favicons/favicon-${resolvedTheme}.ico`;
    applyFavicon(href, resolvedTheme);
  }, [resolvedTheme]);
}
