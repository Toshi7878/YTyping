import Header from "@/app/_components/header/Header";
import "@/styles/globals.css";
// export const runtime = "edge";

import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/server/auth";
import TRPCProvider from "@/trpc/provider";
import { SessionProvider } from "next-auth/react";
import dynamic from "next/dynamic";
import { Noto_Sans_JP } from "next/font/google";
import GlobalProvider from "./_components/global-provider/GlobalProvider";

const PreviewYouTubeContent = dynamic(() => import("@/app/_components/PreviewYouTubeContent"));

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
    <html lang="ja" className={notoSansJP.className}>
      <head>
        <meta charSet="UTF-8" />
      </head>
      <body>
        <SessionProvider session={session}>
          <TRPCProvider>
            <Header />
            <GlobalProvider>
              <main
                className="mx-auto flex min-h-screen max-w-[1300px] flex-col items-center justify-between px-0 pt-12 sm:px-6 md:pt-16 lg:px-8"
                id="main_content"
              >
                {children}
              </main>
              <PreviewYouTubeContent />
            </GlobalProvider>
          </TRPCProvider>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
