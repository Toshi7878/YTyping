"use client";
import theme from "@/theme";
import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";
import { setCookie } from "cookies-next";

import React from "react";

interface ThemeProviderProps {
  colorMode?: any;
  children: React.ReactNode;
}

const ThemeProvider = ({ colorMode, children }: ThemeProviderProps) => {
  // TODO: CacheProvider非推奨

  return (
    <>
      <CacheProvider>
        <ChakraProvider
          colorModeManager={{
            type: "cookie",
            ssr: true,
            get: (init) => colorMode ?? "dark",
            set: (value) => {
              setCookie("chakra-ui-color-mode", value);
            },
          }}
          theme={theme}
        >
          {children}
        </ChakraProvider>
      </CacheProvider>
    </>
  );
};

export default ThemeProvider;
