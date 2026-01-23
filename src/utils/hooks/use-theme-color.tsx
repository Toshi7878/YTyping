"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

const resolveCssColorToRgb = (cssColor: string) => {
  if (typeof document === "undefined") return "";
  const probe = document.createElement("div");
  probe.style.color = cssColor;
  probe.style.display = "none";

  // <body> が無いタイミングを避ける
  (document.body ?? document.documentElement).appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();

  return resolved;
};

export function applyThemeColor() {
  if (typeof document === "undefined") return;

  let meta = document.querySelector('meta[name="theme-color"][data-dynamic="true"]') as HTMLMetaElement | null;

  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.setAttribute("data-dynamic", "true");
    document.head.append(meta);
  }

  const headerBg = getComputedStyle(document.documentElement).getPropertyValue("--color-header-background").trim();
  const resolved = headerBg ? resolveCssColorToRgb(headerBg) : "";
  if (resolved) meta.content = resolved;
}

export function useThemeColor() {
  const { theme, resolvedTheme } = useTheme();
  useEffect(() => {
    requestAnimationFrame(() => applyThemeColor());
  }, [theme, resolvedTheme]);
}
