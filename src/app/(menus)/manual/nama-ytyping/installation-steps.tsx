"use client";
import Image from "next/image";
import { Separator } from "@/ui/separator";
import { H3, LinkText, OList, P } from "@/ui/typography";

export function InstallationSteps() {
  const steps = [
    {
      title: "namaYTypingスクリプトをインストールする",
      content: (
        <P>
          <LinkText href="https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=ja">
            Tampermonkey - Chrome ウェブストア
          </LinkText>
          からTampermonkeyをインストールします。
          <br />
          <LinkText href="https://update.greasyfork.org/scripts/576187/namaYTyping.user.js">
            GreasyFork - namaYTyping
          </LinkText>
          からスクリプトをインストールします。
        </P>
      ),
    },
    {
      title: "変換有りタイピングページで配信URLまたはIDを貼り付ける",
      images: (
        <div className="flex flex-col gap-4">
          <Image
            alt="配信URLまたはIDを貼り付ける"
            src="/images/manual/nama-ytyping/id-input.png"
            width={700}
            height={350}
          />
        </div>
      ),
    },
    {
      title: "開始すると対戦が開始されます",
      images: (
        <div className="flex flex-col gap-4">
          <Image alt="対戦開始" src="/images/manual/nama-ytyping/chat-connect.png" width={700} height={350} />
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
            src="/images/manual/nama-ytyping/header-toggle-switch.png"
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
