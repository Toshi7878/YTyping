"use client";
import { Separator } from "@/components/ui/separator";
import { useUserAgent } from "@/utils/useUserAgent";
import Link from "next/link";
import { ReactNode } from "react";
import { PreMidLinkImage, PreMidPresenceImages } from "./PreMidImages";

const browserLinks = {
  Chrome: {
    url: "https://chromewebstore.google.com/detail/premid/agjnjboanicjcpenljmaaigopkgdnihi",
    text: "PreMiD - Chrome ウェブストア",
  },
  Firefox: {
    url: "https://premid.app/downloads",
    text: "PreMiD Downloads",
  },
  Edge: {
    url: "https://microsoftedge.microsoft.com/addons/detail/premid/hkchpjlnddoppadcbefbpgmgaeidkkkm",
    text: "PreMiD - Microsoft Edge アドオン",
  },
  Safari: {
    url: "https://premid.app/downloads",
    text: "PreMiD Downloads",
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
      <InstallationStep title="PreMiDブラウザ拡張機能をインストールする">
        <p className="mt-2">
          <Link href={browserLink.url}>{browserLink.text}</Link>
          から拡張機能をインストールします。
        </p>
      </InstallationStep>

      <Separator className="my-4" />

      <InstallationStep title="YTypingのプレゼンス設定をPreMiD Storeからインストールする">
        <p className="mt-2">
          <Link href="https://premid.app/store/presences/YTyping">YTyping - PreMiD Store</Link>
          からYTypingのプレゼンス設定を追加します。
        </p>
      </InstallationStep>

      <Separator className="my-4" />

      <InstallationStep title="PreMiD拡張機能を開いてDiscordアカウントとリンクします。">
        <div className="mt-2">
          <p>PreMiD拡張機能を初めて開くと、以下の表示が出てくるので、表示したいDiscordアカウントとリンクする</p>
          <PreMidLinkImage />
        </div>
      </InstallationStep>

      <Separator className="my-4" />

      <InstallationStep title="YTypingをプレイする">
        <p className="mt-2">YTypingをプレイすると、自動的にDiscordのステータスに表示されます。</p>
        <PreMidPresenceImages />
      </InstallationStep>
    </ol>
  );
}

interface InstallationStepProps {
  title: string;
  children: ReactNode;
}

export function InstallationStep({ title, children }: InstallationStepProps) {
  return (
    <li>
      <p className="inline font-bold">{title}</p>
      {children}
    </li>
  );
}
