"use client";
import Image from "next/image";
import { Separator } from "@/ui/separator";
import { H3, LinkText, OList, P } from "@/ui/typography";

export function InstallationSteps() {
  const steps = [
    {
      title: "YTyping Equalizerをインストールする",
      content: (
        <P>
          <LinkText href="https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=ja">
            Tampermonkey - Chrome ウェブストア
          </LinkText>
          からTampermonkeyをインストールします。
          <br />
          <LinkText href="https://greasyfork.org/en/scripts/573777-ytyping-equalizer">
            GreasyFork - YTyping Equalizer
          </LinkText>
          からスクリプトをインストールします。 ヘッダーにEQアイコンが追加され、音質を調整することができます。
        </P>
      ),
      images: (
        <div className="flex flex-col gap-4">
          <Image alt="YTyping Equalizer" src="/images/manual/ytyping-equalizer/image.png" width={500} height={250} />
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
