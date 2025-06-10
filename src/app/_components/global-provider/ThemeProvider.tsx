"use client";
import theme from "@/theme";
import { ChakraProvider } from "@chakra-ui/react";
import { Toaster } from "@/components/ui/sonner";

import React from "react";

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // TODO: CacheProvider非推奨

  return (
    <ChakraProvider theme={theme}>
      {children}
      <Toaster />
    </ChakraProvider>
  );
};

export default ThemeProvider;
