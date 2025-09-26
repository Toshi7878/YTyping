"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type * as React from "react"
import { useFaviconTheme } from "@/utils/use-favicon-theme"

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <FaviconTheme />
      {children}
    </NextThemesProvider>
  )
}

export const FaviconTheme = () => {
  useFaviconTheme()
  return null
}
