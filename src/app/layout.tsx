import Header from "@/components/header/Header";
import "@/styles/globals.css";
import "@/styles/nprogress.css";
import { Analytics } from "@vercel/analytics/react";
import { cookies } from "next/headers";
import { fonts } from "../lib/fonts";
// export const runtime = "edge";

import type { Metadata } from "next";
import ThemeProvider from "./provider/ThemeProvider";

import PreviewYouTubeContent from "@/components/custom-ui/PreviewYouTubeContent";
import { auth } from "@/server/auth";
import TRPCProvider from "@/trpc/provider";
import { SessionProvider } from "next-auth/react";
import GlobalProvider from "./provider/GlobalProvider";

export const metadata: Metadata = {
  title: "YTyping",
  description: "",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookiesList = cookies();
  const colorMode = cookiesList.get("chakra-ui-color-mode");
  const session = await auth();

  return (
    <html lang="ja">
      <body className={fonts.rubik.variable}>
        <Analytics />
        <ThemeProvider colorMode={colorMode?.value}>
          <SessionProvider session={session}>
            <TRPCProvider>
              <Header session={session} />
              <GlobalProvider>
                {children}
                <PreviewYouTubeContent />
              </GlobalProvider>
            </TRPCProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
