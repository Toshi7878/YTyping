import Header from "@/app/_components/header/Header";
import "@/styles/globals.css";
import { cookies } from "next/headers";
// export const runtime = "edge";

import type { Metadata } from "next";

import LinkLoader from "@/components/ui/link-loader";
import { auth } from "@/server/auth";
import TRPCProvider from "@/trpc/provider";
import { serverApi } from "@/trpc/server";
import { ColorModeScript } from "@chakra-ui/react";
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
  const cookiesList = await cookies();
  const colorMode = cookiesList.get("chakra-ui-color-mode");
  const session = await auth();

  const userOptions = process.env.NODE_ENV === "development" ? null : await serverApi.userOption.getUserOptions({});

  return (
    <html lang="ja">
      <head>
        <meta charSet="UTF-8" />
        <ColorModeScript initialColorMode="dark" />
      </head>
      <body>
        <LinkLoader />
        <ThemeProvider colorMode={colorMode?.value}>
          <SessionProvider session={session}>
            <TRPCProvider>
              <Header />
              <GlobalProvider userOptions={userOptions}>
                <main
                  className="max-w-[1300px] mx-auto px-0 sm:px-6 lg:px-8 min-h-screen flex flex-col items-center justify-between pt-12 md:pt-16"
                  id="main_content"
                >
                  {children}
                </main>
                <PreviewYouTubeContent />
              </GlobalProvider>
            </TRPCProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
