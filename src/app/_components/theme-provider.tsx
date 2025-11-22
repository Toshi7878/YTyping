"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";
import { useFaviconTheme } from "@/utils/hooks/use-favicon-theme";

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <FaviconTheme />
      {children}
    </NextThemesProvider>
  );
}

const FaviconTheme = () => {
  useFaviconTheme();
  return null;
};
