import { Header } from "@/app/_layout/header/header";
import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { headers } from "next/headers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { getSession } from "@/lib/auth";
import { THEME_LIST } from "@/styles/const";
import TRPCProvider from "@/trpc/provider";
import { caller } from "@/trpc/server";
import { ConfirmDialogHost } from "@/ui/confirm-dialog";
import { OverlayHost } from "@/ui/overlay";
import { Toaster } from "@/ui/sonner";
import { TooltipProvider } from "@/ui/tooltip";
import { ClearSelectionOnNavigate } from "@/utils/hooks/clear-selection-on-navigate";
import { AppAtomsHydrator } from "./_layout/hydrate";
import { LinkProgressProvider } from "./_layout/link-progress-provider";
import { PreviewYouTubePlayer } from "./_layout/preview-youtube";
import { SessionProvider } from "./_layout/session-provider";
import { ThemeProvider } from "./_layout/theme-provider";
import { UserScriptInit } from "./_layout/user-script";

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
  const userAgent = (await headers()).get("user-agent") ?? "";
  const session = await getSession();
  const userOptions = await caller.user.option.getForSession();

  return (
    <html lang="ja" className={notoSansJP.className} suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="robots" content="noindex, nofollow" />
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
            <TRPCProvider>
              <TooltipProvider delayDuration={600}>
                <AppAtomsHydrator userOptions={userOptions} userAgent={userAgent}>
                  <SessionProvider session={session}>
                    <LinkProgressProvider>
                      <Header className="fixed z-50 h-10 w-screen" session={session} />
                      <main className="min-h-screen pt-12 pb-6 md:pt-16" id="main_content">
                        {children}
                        <Analytics />
                      </main>
                      <PreviewYouTubePlayer />
                    </LinkProgressProvider>
                  </SessionProvider>
                </AppAtomsHydrator>
              </TooltipProvider>
            </TRPCProvider>
          </ThemeProvider>
        </NuqsAdapter>
        <Toaster />
        <ConfirmDialogHost />
        <OverlayHost />
        <ClearSelectionOnNavigate />
        <UserScriptInit />
      </body>
    </html>
  );
}
