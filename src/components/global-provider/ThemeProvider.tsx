"use client";
import theme from "@/theme";
import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { setCookie } from "cookies-next";

import React from "react";

interface ThemeProviderProps {
  colorMode?: any;
  children: React.ReactNode;
}

const ThemeProvider = ({ colorMode, children }: ThemeProviderProps) => {
  return (
    <>
      <CacheProvider>
        <ColorModeScript type="cookie" initialColorMode={theme.config.initialColorMode} />
        <ChakraProvider
          colorModeManager={{
            type: "cookie",
            ssr: true,
            get: (init) => colorMode ?? init,
            set: (value) => {
              setCookie("chakra-ui-color-mode", value);
            },
          }}
          theme={theme}
        >
          {children}
        </ChakraProvider>
      </CacheProvider>

      <style>
        {`#nprogress .bar {
	  background:${theme.colors.primary.light};
  }`}
      </style>
    </>
  );
};

export default ThemeProvider;
