"use client";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { H3, LinkText, OList, P } from "@/components/ui/typography";

export function InstallationSteps() {
  const steps = [
    {
      title: "NamaYTyping UserScriptをインストールする",
      content: (
        <P>
          <LinkText href="https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=ja">
            Tampermonkey - Chrome ウェブストア
          </LinkText>
          からTampermonkeyをインストールします。
          <br />
          <LinkText href="https://greasyfork.org/en/scripts/576187-namaytyping-youtube">
            GreasyFork - NamaYTyping UserScript
          </LinkText>
          からスクリプトをインストールします。 YouTube Live上のチャットでの対戦が可能になります。
        </P>
      ),
      images: (
        <div className="flex flex-col gap-4">
          <Image alt="YTyping Equalizer" src="/images/manual/nama-typing/id-input.png" width={500} height={250} />
        </div>
      ),
    },
    {
      title: "変換有りタイピングページで配信URLまたはIDを貼り付ける",
      images: (
        <div className="flex flex-col gap-4">
          <Image
            alt="配信URLまたはIDを貼り付ける"
            src="/images/manual/nama-typing/id-input.png"
            width={500}
            height={250}
          />
        </div>
      ),
    },
    {
      title: "URLかIDが入力された状態で開始すると対戦が開始されます",
      images: (
        <div className="flex flex-col gap-4">
          <Image alt="対戦開始" src="/images/manual/nama-typing/chat-connect.png" width={500} height={250} />
        </div>
      ),
    },
    {
      title: "譜面のリンクを変換ありタイピングページに変更する",
      content: <P>ヘッダーのトグルから譜面一覧等のリンク先を変換ありタイピングに変更できます</P>,
      images: (
        <div className="flex flex-col gap-4">
          <Image
            alt="譜面のリンクを変換ありタイピングページに変更する"
            src="/images/manual/nama-typing/header-toggle-switch.png"
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
