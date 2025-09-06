"use client";
import { Separator } from "@/components/ui/separator";
import { H6 } from "@/components/ui/typography";
import preMidLinks from "@/public/images/manual/premid/premid-link.png";
import preMidPresence1 from "@/public/images/manual/premid/premid-presence-1.png";
import preMidPresence2 from "@/public/images/manual/premid/premid-presence-2.png";
import { useUserAgent } from "@/utils/useUserAgent";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

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
          <Link href={browserLink.url} className="text-link hover:underline">
            {browserLink.text}
          </Link>
          から拡張機能をインストールします。
        </p>
      </InstallationStep>

      <Separator className="my-4" />

      <InstallationStep title="YTypingのプレゼンス設定をPreMiD Storeからインストールする">
        <p className="mt-2">
          <Link href="https://premid.app/store/presences/YTyping" className="text-link hover:underline">
            YTyping - PreMiD Store
          </Link>
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

      <InstallationStep title="見た目を微調整する">
        <p className="mt-2">
          拡張機能のStylusアイコンからスタイルの編集を行うと、プレイヤーのサイズや透過度を調整できます。
        </p>
        <PreMidPresenceImages />
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

export function PreMidLinkImage() {
  return (
    <Image
      alt="PreMID拡張機能を開いてDiscordアカウントとリンクします。"
      src={preMidLinks}
      width={250}
      height={0}
      className="border-border mt-2 rounded border"
    />
  );
}

export function PreMidPresenceImages() {
  return (
    <div className="mt-2 flex flex-col gap-4">
      <Image
        width={250}
        height={0}
        alt="スクリーンショット1"
        src={preMidPresence1}
        className="border-border rounded border"
      />
      <Image
        width={250}
        height={0}
        alt="スクリーンショット2"
        src={preMidPresence2}
        className="border-border rounded border"
      />
    </div>
  );
}
