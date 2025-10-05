"use client";
import type { Route } from "next";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { H3, LinkText, OList, P } from "@/components/ui/typography";
import { useUserAgent } from "@/lib/global-atoms";
import preMidLinks from "@/public/images/manual/premid/premid-link.png";
import preMidPresence1 from "@/public/images/manual/premid/premid-presence-1.png";
import preMidPresence2 from "@/public/images/manual/premid/premid-presence-2.png";

const browserLinks: Record<string, { url: Route; text: string }> = {
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
  const browserType = userAgent?.getBrowser().name;
  const browserLink = browserLinks[browserType as keyof typeof browserLinks];
  if (!browserLink) return browserLinks.Chrome;

  return browserLink;
};

export function InstallationSteps() {
  const browserLink = useBrowserLink();

  const steps = [
    {
      title: "PreMiDブラウザ拡張機能をインストールする",
      content: (
        <P>
          <LinkText href={browserLink.url}>{browserLink.text}</LinkText>
          から拡張機能をインストールします。
        </P>
      ),
    },
    {
      title: "YTypingのプレゼンス設定をPreMiD Storeからインストールする",
      content: (
        <P>
          <LinkText href="https://premid.app/store/presences/YTyping">YTyping - PreMiD Store</LinkText>
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
      alt="PreMID拡張機能を開いてDiscordアカウントとリンクします。"
      src={preMidLinks}
      width={250}
      height={0}
      className="border-border mt-2 rounded border"
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
