import { Header } from "@/app/_components/header/header";
import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
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
import { PreviewYouTubePlayer } from "./_components/preview-youtube-player";
import { JotaiProvider, MainProvider } from "./_components/provider";
import { ThemeProvider } from "./_components/theme-provider";

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
                    <JotaiProvider userAgent={userAgent}>
                      <MainProvider>
                        <main className="min-h-screen pt-12 pb-6 md:pt-16" id="main_content">
                          {children}
                          <Analytics />
                        </main>
                        <PreviewYouTubePlayer />
                      </MainProvider>
                    </JotaiProvider>
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
