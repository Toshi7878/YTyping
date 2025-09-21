"use client";

import { useFaviconTheme } from "@/utils/use-favicon-theme";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <FaviconTheme />
      {children}
    </NextThemesProvider>
  );
}

export const FaviconTheme = () => {
  useFaviconTheme();
  return null;
};
