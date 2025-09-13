// src/components/ThemeSheet.tsx
"use client";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { THEME_LIST } from "@/styles/const";
import { applyFavicon } from "@/utils/use-favicon-theme";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

export function ThemeDropdownSubmenu() {
  const { setTheme, resolvedTheme } = useTheme();
  const hoverTimerRef = useRef<number | null>(null);
  const HOVER_DELAY_MS = 450;

  const clearHoverTimer = () => {
    if (hoverTimerRef.current != null) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const applyPreview = (theme: string) => {
    const html = document.documentElement;
    for (const theme of THEME_LIST.dark) html.classList.remove(theme.class);
    for (const theme of THEME_LIST.light) html.classList.remove(theme.class);
    html.classList.add(theme);
  };

  const schedulePreview = (theme: string) => {
    clearHoverTimer();
    hoverTimerRef.current = window.setTimeout(() => {
      applyPreview(theme);
    }, HOVER_DELAY_MS);
  };

  const resetPreview = () => {
    clearHoverTimer();
    const html = document.documentElement;
    for (const theme of THEME_LIST.dark) html.classList.remove(theme.class);
    for (const theme of THEME_LIST.light) html.classList.remove(theme.class);
    if (resolvedTheme) html.classList.add(resolvedTheme);
  };

  useEffect(() => {
    return () => {
      resetPreview();
    };
  }, [resolvedTheme]);

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>テーマ切り替え</DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className="w-40" onMouseLeave={resetPreview}>
          <DropdownMenuGroup>
            <DropdownMenuLabel>ダークテーマ</DropdownMenuLabel>
            {THEME_LIST.dark.map((theme) => (
              <DropdownMenuItem
                key={theme.class}
                className={resolvedTheme === theme.class ? "font-bold" : undefined}
                onMouseEnter={() => schedulePreview(theme.class)}
                onFocus={() => schedulePreview(theme.class)}
                onMouseLeave={clearHoverTimer}
                onBlur={clearHoverTimer}
                onClick={() => {
                  setTheme(theme.class);
                  applyFavicon(`/favicons/favicon-${theme.class}.ico`, theme.class);
                }}
              >
                {theme.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>ライトテーマ</DropdownMenuLabel>
            {THEME_LIST.light.map((theme) => (
              <DropdownMenuItem
                key={theme.class}
                className={resolvedTheme === theme.class ? "font-bold" : undefined}
                onMouseEnter={() => schedulePreview(theme.class)}
                onFocus={() => schedulePreview(theme.class)}
                onMouseLeave={clearHoverTimer}
                onBlur={clearHoverTimer}
                onClick={() => {
                  setTheme(theme.class);
                  applyFavicon(`/favicons/favicon-${theme.class}.ico`, theme.class);
                }}
              >
                {theme.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
