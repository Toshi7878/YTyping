// src/components/ThemeSheet.tsx
"use client";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { THEME_LIST } from "@/theme/const";
import { applyFavicon } from "@/theme/use-favicon-theme";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/ui/dropdown-menu";

export const ThemeDropdownSubmenu = () => {
  const t = useTranslations("header.theme");
  const { setTheme, resolvedTheme } = useTheme();

  const handleThemeChange = (themeClass: string) => {
    applyFavicon(themeClass);
    setTheme(themeClass);
  };

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>{t("label")}</DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className="w-40">
          <DropdownMenuGroup>
            <DropdownMenuLabel>{t("dark")}</DropdownMenuLabel>
            {THEME_LIST.dark.map((theme) => (
              <DropdownMenuItem
                key={theme.class}
                className={resolvedTheme === theme.class ? "font-bold" : undefined}
                closeOnClick={false}
                onClick={() => handleThemeChange(theme.class)}
              >
                <span>{theme.label}</span>
                {resolvedTheme === theme.class ? (
                  <Check className="ml-auto size-5 hover:text-primary-foreground" />
                ) : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>{t("light")}</DropdownMenuLabel>
            {THEME_LIST.light.map((theme) => (
              <DropdownMenuItem
                key={theme.class}
                className={resolvedTheme === theme.class ? "font-bold" : undefined}
                closeOnClick={false}
                onClick={() => handleThemeChange(theme.class)}
              >
                <span>{theme.label}</span>
                {resolvedTheme === theme.class ? (
                  <Check className="ml-auto size-5 hover:text-primary-foreground" />
                ) : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
};
