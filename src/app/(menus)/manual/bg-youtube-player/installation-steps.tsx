"use client";
import type { Route } from "next";
import Image from "next/image";
import { useBrowserTypeState } from "@/store/user-agent";
import { Separator } from "@/ui/separator";
import { H3, LinkText, OList, P } from "@/ui/typography";

const CHROME_STORE_URL = "https://chromewebstore.google.com/detail/stylus/clngdbkpkpeebahjckkjfobafhncgmne" as Route;
const FIREFOX_URL = "https://addons.mozilla.org/firefox/addon/styl-us/" as Route;
const TAMPERMONKEY_URL =
  "https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo" as Route;

const useBrowserLink = () => {
  const browserType = useBrowserTypeState();
  if (browserType === "Firefox") return { url: FIREFOX_URL, text: "Stylus Downloads" };
  return { url: CHROME_STORE_URL, text: "Stylus - Chrome ウェブストア" };
};

export function InstallationSteps() {
  const browserLink = useBrowserLink();
  const steps = [
    {
      title: "Stylusブラウザ拡張機能をインストールする",
      content: (
        <P>
          <LinkText href={browserLink.url}>{browserLink.text}</LinkText>から拡張機能をインストールします。
        </P>
      ),
    },
    {
      title: "UserStyles.worldからスタイルをインストールする",
      content: (
        <P>
          <LinkText href={"https://userstyles.world/style/24064" as Route}>
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
    {
      title: "動画の境界にぼかしを追加する(任意)",
      content: (
        <P>
          <LinkText href={TAMPERMONKEY_URL}>Tampermonkey - Chrome ウェブストア</LinkText>
          からTampermonkeyをインストールします。
          <br />
          <LinkText href={"https://greasyfork.org/en/scripts/564909-ytyping-youtube-inner-edge-shadow" as Route}>
            GreasyFork - YTyping YouTube Inner Edge Shadow
          </LinkText>
          からスクリプトをインストールします。 このスクリプトを使用すると、動画の境界にぼかしを追加することができます。
        </P>
      ),
      images: (
        <div className="flex flex-col gap-4">
          <Image
            alt="適用前"
            src="/images/manual/background-youtube-layout/inner-edge-shadow/before.png"
            width={500}
            height={250}
          />
          <Image
            alt="適用後"
            src="/images/manual/background-youtube-layout/inner-edge-shadow/after.png"
            width={500}
            height={250}
          />
        </div>
      ),
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
          {step.images}
          {i !== steps.length - 1 && <Separator className="my-4" />}
        </>
      ))}
    />
  );
}
