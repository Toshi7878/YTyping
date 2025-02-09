import Header from "@/app/_components/header/Header";
import "@/styles/globals.css";
import "@/styles/nprogress.css";
import { cookies } from "next/headers";
import { fonts } from "../lib/fonts";
// export const runtime = "edge";

import type { Metadata } from "next";

import { cn } from "@/lib/utils";
import { auth } from "@/server/auth";
import TRPCProvider from "@/trpc/provider";
import { serverApi } from "@/trpc/server";
import { SessionProvider } from "next-auth/react";
import dynamic from "next/dynamic";
import GlobalProvider from "./_components/global-provider/GlobalProvider";
import ThemeProvider from "./_components/global-provider/ThemeProvider";

const PreviewYouTubeContent = dynamic(() => import("@/app/_components/PreviewYouTubeContent"), {
  ssr: false,
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
  const cookiesList = cookies();
  const colorMode = cookiesList.get("chakra-ui-color-mode");
  const session = await auth();
  const userOptions = await serverApi.userOption.getUserOptions();

  return (
    <html lang="ja">
      <body className={cn(fonts.rubik.variable, "no-ligatures ")}>
        <ThemeProvider colorMode={colorMode?.value}>
          <SessionProvider session={session}>
            <TRPCProvider>
              <Header session={session} />
              <GlobalProvider userOptions={userOptions}>
                <main
                  className="min-h-screen  flex flex-col items-center justify-between pt-12 md:pt-16 mx-auto max-w-screen-2xl"
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
