"use client";
import type { Route } from "next";
import { Separator } from "@/components/ui/separator";
import { H3, LinkText, OList, P } from "@/components/ui/typography";
import { useBrowserTypeState } from "@/lib/atoms/user-agent";

const browserLinks: Record<"Chrome" | "Firefox" | "Edge", { url: Route; text: string }> = {
  Chrome: {
    url: "https://chromewebstore.google.com/detail/stylus/clngdbkpkpeebahjckkjfobafhncgmne?hl=ja",
    text: "Stylus - Chrome ウェブストア",
  },
  Firefox: {
    url: "https://addons.mozilla.org/ja/firefox/addon/styl-us/",
    text: "Stylus Downloads",
  },
  Edge: {
    url: "https://chromewebstore.google.com/detail/stylus/clngdbkpkpeebahjckkjfobafhncgmne?hl=ja",
    text: "Stylus - Chrome ウェブストア",
  },
};

const useBrowserLink = () => {
  const browserType = useBrowserTypeState();
  if (browserType === "Chrome") return browserLinks.Chrome;
  if (browserType === "Firefox") return browserLinks.Firefox;
  if (browserType === "Edge") return browserLinks.Edge;
  return browserLinks.Chrome;
};

export function InstallationSteps() {
  const browserLink = useBrowserLink();
  const steps = [
    {
      title: "Stylusブラウザ拡張機能をインストールする",
      content: (
        <P>
          <LinkText href={browserLink.url}>{browserLink.text}</LinkText>
          から拡張機能をインストールします。
        </P>
      ),
    },
    {
      title: "UserStyles.worldからスタイルをインストールする",
      content: (
        <P>
          <LinkText href="https://userstyles.world/style/24064">
            YTyping YouTube Background Player - userstyles.world
          </LinkText>
          からスタイルをインストールします。
        </P>
      ),
    },
    {
      title: "YTypingをプレイする",
      content: <P>YTypingをプレイすると、YouTubeの動画が背景に表示されます。</P>,
    },
    {
      title: "見た目を微調整する",
      content: <P>拡張機能のStylusアイコンからスタイルの編集を行うと、プレイヤーのサイズや透過度を調整できます。</P>,
    },
  ];

  return (
    <OList
      className="list-inside list-decimal space-y-6"
      listClassName="marker:text-lg marker:font-semibold"
      items={steps.map((step, i) => (
        <>
          <H3 className="inline">{step.title}</H3>
          {step.content}
          {i !== steps.length - 1 && <Separator className="my-4" />}
        </>
      ))}
    />
  );
}
