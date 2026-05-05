"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type React from "react";
import { useFaviconTheme } from "@/theme/use-favicon-theme";
import { useThemeColor } from "@/theme/use-theme-color";

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <ClientThemeSideEffects />
      {children}
    </NextThemesProvider>
  );
}

const ClientThemeSideEffects = () => {
  useFaviconTheme();
  useThemeColor();
  return null;
};
