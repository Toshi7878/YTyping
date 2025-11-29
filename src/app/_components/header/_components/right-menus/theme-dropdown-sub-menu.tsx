// src/components/ThemeSheet.tsx
"use client";
import { Check } from "lucide-react";
import { useTheme } from "next-themes";
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
import { applyFavicon } from "@/utils/hooks/use-favicon-theme";

export const ThemeDropdownSubmenu = () => {
  const { setTheme, resolvedTheme } = useTheme();

  const handleThemeChange = (themeClass: string) => {
    applyFavicon(themeClass);
    setTheme(themeClass);
  };

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>テーマ切り替え</DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className="w-40">
          <DropdownMenuGroup>
            <DropdownMenuLabel>ダークテーマ</DropdownMenuLabel>
            {THEME_LIST.dark.map((theme) => (
              <DropdownMenuItem
                key={theme.class}
                className={resolvedTheme === theme.class ? "font-bold" : undefined}
                onSelect={(e) => e.preventDefault()}
                onClick={() => handleThemeChange(theme.class)}
              >
                <span>{theme.label}</span>
                {resolvedTheme === theme.class ? (
                  <Check className="hover:text-primary-foreground ml-auto size-5" />
                ) : null}
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
                onSelect={(e) => e.preventDefault()}
                onClick={() => handleThemeChange(theme.class)}
              >
                <span>{theme.label}</span>
                {resolvedTheme === theme.class ? (
                  <Check className="hover:text-primary-foreground ml-auto size-5" />
                ) : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
};
