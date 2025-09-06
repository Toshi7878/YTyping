"use client";
import { Separator } from "@/components/ui/separator";
import { H6 } from "@/components/ui/typography";
import { useUserAgent } from "@/utils/useUserAgent";
import Link from "next/link";
import type { ReactNode } from "react";

const browserLinks = {
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
  const browserType = userAgent?.browser?.name;
  const browserLink = browserLinks[browserType as keyof typeof browserLinks];
  if (!browserLink) return browserLinks.Chrome;

  return browserLink;
};

export function InstallationSteps() {
  const browserLink = useBrowserLink();
  return (
    <ol className="list-inside list-decimal space-y-6">
      <InstallationStep title="Stylusブラウザ拡張機能をインストールする">
        <p className="mt-2">
          <Link href={browserLink.url} className="text-link hover:underline">
            {browserLink.text}
          </Link>
          から拡張機能をインストールします。
        </p>
      </InstallationStep>

      <Separator className="my-4" />

      <InstallationStep title="UserStyles.worldからスタイルをインストールする">
        <p className="mt-2">
          <Link href="https://userstyles.world/style/24064" className="text-link hover:underline">
            YTyping YouTube Background Player - userstyles.world
          </Link>
          からスタイルをインストールします。
        </p>
      </InstallationStep>

      <Separator className="my-4" />

      <InstallationStep title="YTypingをプレイする">
        <p className="mt-2">YTypingをプレイすると、YouTubeの動画が背景に表示されます。</p>
      </InstallationStep>
      <InstallationStep title="見た目を微調整する">
        <p className="mt-2">
          拡張機能のStylusアイコンからスタイルの編集を行うと、プレイヤーのサイズや透過度を調整できます。
        </p>
      </InstallationStep>
    </ol>
  );
}

interface InstallationStepProps {
  title: string;
  children: ReactNode;
}

function InstallationStep({ title, children }: InstallationStepProps) {
  return (
    <li>
      <H6 className="inline">{title}</H6>
      {children}
    </li>
  );
}
