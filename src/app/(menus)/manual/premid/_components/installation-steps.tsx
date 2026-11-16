"use client";
import type { Route } from "next";
import Image from "next/image";
import { useBrowserTypeState } from "@/store/user-agent";
import { Separator } from "@/ui/separator";
import { H3, LinkText, OList, P } from "@/ui/typography";

const DOWNLOADS_URL = "https://premid.app/downloads" as Route;

const useBrowserLink = () => {
  const browserType = useBrowserTypeState();

  switch (browserType) {
    case "Firefox":
    case "Safari":
      return { url: DOWNLOADS_URL, text: "PreMiD Downloads" };
    case "Edge":
      return {
        url: "https://microsoftedge.microsoft.com/addons/detail/premid/hkchpjlnddoppadcbefbpgmgaeidkkkm" as Route,
        text: "PreMiD - Microsoft Edge アドオン",
      };
    default:
      return {
        url: "https://chromewebstore.google.com/detail/premid/agjnjboanicjcpenljmaaigopkgdnihi" as Route,
        text: "PreMiD - Chrome ウェブストア",
      };
  }
};

export function InstallationSteps() {
  const browserLink = useBrowserLink();

  const steps = [
    {
      title: "PreMiDブラウザ拡張機能をインストールする",
      content: (
        <P>
          <LinkText href={browserLink.url}>{browserLink.text}</LinkText>から拡張機能をインストールします。
        </P>
      ),
    },
    {
      title: "YTypingのプレゼンス設定をPreMiD Storeからインストールする",
      content: (
        <P>
          <LinkText href={"https://premid.app/store/presences/YTyping" as Route}>YTyping - PreMiD Store</LinkText>
          からYTypingのプレゼンス設定を追加します。
        </P>
      ),
    },
    {
      title: "PreMiD拡張機能を開いてDiscordアカウントとリンクします。",
      content: <P>PreMiD拡張機能を初めて開くと、以下の表示が出てくるので、表示したいDiscordアカウントとリンクする</P>,
      images: <PreMidLinkImage />,
    },
    {
      title: "YTypingをプレイする",
      content: <P>YTypingをプレイすると、自動的にDiscordのステータスに表示されます。</P>,
      images: <PreMidPresenceImages />,
    },
  ];

  return (
    <OList
      className="space-y-6"
      listClassName="marker:text-lg marker:font-semibold"
      items={steps.map((step, i) => (
        <>
          <H3>{step.title}</H3>
          {step.content}
          {step.images}
          {i !== steps.length - 1 && <Separator className="my-4" />}
        </>
      ))}
    />
  );
}

function PreMidLinkImage() {
  return (
    <Image
      alt="PreMiD拡張機能を開いてDiscordアカウントとリンクします。"
      src="/images/manual/premid/premid-link.png"
      width={250}
      height={0}
      className="mt-2 rounded border border-border"
    />
  );
}

function PreMidPresenceImages() {
  return (
    <div className="mt-2 flex flex-col gap-4">
      <Image
        width={250}
        height={0}
        alt="スクリーンショット1"
        src="/images/manual/premid/premid-presence-1.png"
        className="rounded border border-border"
      />
      <Image
        width={250}
        height={0}
        alt="スクリーンショット2"
        src="/images/manual/premid/premid-presence-2.png"
        className="rounded border border-border"
      />
    </div>
  );
}
