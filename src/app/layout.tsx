import "@/css/globals.css";
import "@/css/nprogress.css";
import Header from "@/components/header/Header";
import { fonts } from "../lib/fonts";
import { Analytics } from "@vercel/analytics/react";
import { cookies } from "next/headers";

// export const runtime = "edge";

import type { Metadata } from "next";
import ThemeProvider from "./provider/ThemeProvider";
import GlobalProvider from "./provider/GlobalProvider";

export const metadata: Metadata = {
  title: "YTyping",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookiesList = cookies();
  const colorMode = cookiesList.get("chakra-ui-color-mode");

  return (
    <html lang="ja">
      <body className={fonts.rubik.variable}>
        <Analytics />
        <ThemeProvider colorMode={colorMode?.value}>
          <Header />
          <GlobalProvider>{children}</GlobalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
