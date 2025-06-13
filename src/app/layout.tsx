import Header from "@/app/_components/header/Header";
import "@/styles/globals.css";
// export const runtime = "edge";

import type { Metadata } from "next";

import LinkLoader from "@/components/ui/link-loader";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/server/auth";
import TRPCProvider from "@/trpc/provider";
import { serverApi } from "@/trpc/server";
import { SessionProvider } from "next-auth/react";
import dynamic from "next/dynamic";
import GlobalProvider from "./_components/global-provider/GlobalProvider";
import ThemeProvider from "./_components/global-provider/ThemeProvider";

// Next.js 15では ssr: false オプションを削除
const PreviewYouTubeContent = dynamic(() => import("@/app/_components/PreviewYouTubeContent"));

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

  const userOptions = process.env.NODE_ENV === "development" ? null : await serverApi.userOption.getUserOptions({});

  return (
    <html lang="ja">
      <head>
        <meta charSet="UTF-8" />
      </head>
      <body>
        <LinkLoader />
        <ThemeProvider>
          <SessionProvider session={session}>
            <TRPCProvider>
              <Header />
              <GlobalProvider userOptions={userOptions}>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
