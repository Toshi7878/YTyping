"use client";
import type { Route } from "next";
import { Separator } from "@/components/ui/separator";
import { TextLink } from "@/components/ui/text-link";
import { H3, OList, P } from "@/components/ui/typography";
import { useUserAgent } from "@/lib/global-atoms";

const browserLinks: Record<string, { url: Route; text: string }> = {
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
  const userAgent = useUserAgent();
  const browserType = userAgent?.getBrowser().name;
  const browserLink = browserLinks[browserType as keyof typeof browserLinks];
  if (!browserLink) return browserLinks.Chrome;

  return browserLink;
};

export function InstallationSteps() {
  const browserLink = useBrowserLink();
  const steps = [
    {
      title: "Stylusブラウザ拡張機能をインストールする",
      content: (
        <P>
          <TextLink href={browserLink.url}>{browserLink.text}</TextLink>
          から拡張機能をインストールします。
        </P>
      ),
    },
    {
      title: "UserStyles.worldからスタイルをインストールする",
      content: (
        <P>
          <TextLink href="https://userstyles.world/style/24064">
            YTyping YouTube Background Player - userstyles.world
          </TextLink>
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
