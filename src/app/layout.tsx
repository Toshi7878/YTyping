import { Header } from "@/app/_components/header/header";
import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { headers } from "next/headers";
import { SessionProvider } from "next-auth/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ConfirmDialogHost } from "@/components/ui/confirm-dialog";
import { OverlayHost } from "@/components/ui/overlay";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/server/auth";
import { THEME_LIST } from "@/styles/const";
import TRPCProvider from "@/trpc/provider";
import { serverApi } from "@/trpc/server";
import { ClearSelectionOnNavigate } from "@/utils/hooks/clear-selection-on-navigate";
import { JotaiProvider } from "./_components/jotai-provider";
import { LinkProgressProvider } from "./_components/link-progress-provider";
import { PreviewYouTubePlayer } from "./_components/preview-youtube-player";
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
  const userOptions = await serverApi.user.option.getForSession();

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
                  <Header className="fixed z-50 h-10 w-full" />
                  <JotaiProvider userOptions={userOptions} userAgent={userAgent}>
                    <main className="min-h-screen pt-12 pb-6 md:pt-16" id="main_content">
                      {children}
                      <Analytics />
                    </main>
                    <PreviewYouTubePlayer />
                  </JotaiProvider>
                </LinkProgressProvider>
              </TRPCProvider>
            </SessionProvider>
          </ThemeProvider>
        </NuqsAdapter>
        <Toaster />
        <ConfirmDialogHost />
        <OverlayHost />
        <ClearSelectionOnNavigate />
      </body>
    </html>
  );
}
