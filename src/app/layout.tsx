import Header from "@/app/_components/header/Header";
import "@/styles/globals.css";
// export const runtime = "edge";
import type { Metadata } from "next";

import { AlertDialogProvider } from "@/components/ui/alert-dialog/alert-dialog-provider";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/server/auth";
import { THEME_LIST } from "@/styles/const";
import TRPCProvider from "@/trpc/provider";
import { SessionProvider } from "next-auth/react";
import dynamic from "next/dynamic";
import { Noto_Sans_JP } from "next/font/google";
import Script from "next/script";
import LinkProgressProvider from "./_components/LinkProgressProvider";
import MainProvider from "./_components/MainProvider";
import { ThemeProvider } from "./_components/ThemeProvider";
import { FaviconTheme } from "./_components/favicon-theme";

const PreviewYouTubeContent = dynamic(() => import("@/app/_components/PreviewYouTubePlayer"));

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "YTyping",
  description: "",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="ja" className={notoSansJP.className} suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <Script crossOrigin="anonymous" src="//unpkg.com/react-scan/dist/auto.global.js" />
      </head>
      <body>
        <SessionProvider session={session}>
          <TRPCProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="default"
              enableColorScheme
              disableTransitionOnChange
              themes={THEME_LIST.map((theme) => theme.class)}
            >
              <FaviconTheme />
              <LinkProgressProvider>
                <AlertDialogProvider>
                  <Header className="fixed z-30 h-10 w-full" />
                  <MainProvider>
                    <main className="min-h-screen pt-12 md:pt-16" id="main_content">
                      {children}
                    </main>
                    <PreviewYouTubeContent />
                  </MainProvider>
                </AlertDialogProvider>
              </LinkProgressProvider>
            </ThemeProvider>
          </TRPCProvider>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
