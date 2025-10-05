import { Header } from "@/app/_components/header/header-component";
import "@/styles/globals.css";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Noto_Sans_JP } from "next/font/google";
import { headers } from "next/headers";
import { SessionProvider } from "next-auth/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AlertDialogProvider } from "@/components/ui/alert-dialog/alert-dialog-provider";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/server/auth";
import { THEME_LIST } from "@/styles/const";
import TRPCProvider from "@/trpc/provider";
import { LinkProgressProvider } from "./_components/link-progress-provider";
import { MainProvider } from "./_components/main-provider";
import { ThemeProvider } from "./_components/theme-provider";

const PreviewYouTubePlayer = dynamic(() => import("@/app/_components/preview-youtube-player"));

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "YTyping",
  description: "",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth();
  const userAgent = (await headers()).get("user-agent") ?? "";

  return (
    <html lang="ja" className={notoSansJP.className} suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
      </head>
      <body>
        <NuqsAdapter>
          <ThemeProvider
            attribute="class"
            defaultTheme="default"
            enableColorScheme
            disableTransitionOnChange
            themes={[...THEME_LIST.dark.map((theme) => theme.class), ...THEME_LIST.light.map((theme) => theme.class)]}
          >
            <SessionProvider session={session}>
              <TRPCProvider>
                <LinkProgressProvider>
                  <AlertDialogProvider>
                    <Header className="fixed z-50 h-10 w-full" />
                    <MainProvider userAgent={userAgent}>
                      <main className="min-h-screen pt-12 md:pt-16" id="main_content">
                        {children}
                      </main>
                      <PreviewYouTubePlayer />
                    </MainProvider>
                  </AlertDialogProvider>
                </LinkProgressProvider>
              </TRPCProvider>
            </SessionProvider>
          </ThemeProvider>
        </NuqsAdapter>
        <Toaster />
      </body>
    </html>
  );
}
