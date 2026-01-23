"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type React from "react";
import { useFaviconTheme } from "@/utils/hooks/use-favicon-theme";
import { useThemeColor } from "@/utils/hooks/use-theme-color";

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
