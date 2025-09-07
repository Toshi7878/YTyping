import { CardWithContent } from "@/components/ui/card";
import { H2, H3, H5, Small } from "@/components/ui/typography";
import Link from "next/link";
export default function Page() {
  return (
    <div className="mx-auto max-w-screen-xl space-y-4">
      <H2>クレジット</H2>
      <CardWithContent className={{ cardContent: "space-y-10" }}>
        <BorrowedMaterials />
        <SpecialThanks />
      </CardWithContent>
    </div>
  );
}

const BorrowedMaterials = () => {
  return (
    <section className="flex flex-col gap-2">
      <H3>お借りした素材</H3>
      <ul className="space-y-6">
        <li className="space-y-2">
          <H5>
            <Link href="http://www.kurage-kosho.info/system.html" className="text-link hover:underline" target="_blank">
              くらげ工匠
            </Link>
            <span className="ml-1">様</span>
          </H5>
          <div className="flex flex-col space-y-3 pl-4">
            <Small>・打鍵音 ボタン58</Small>
            <Small>・ミス音 ボタン40</Small>
            <Small>・打ち切り音 ボタン68</Small>
          </div>
        </li>
      </ul>
    </section>
  );
};

const SpecialThanks = () => {
  return (
    <section className="flex flex-col gap-2">
      <H3>スペシャルサンクス</H3>
      <ul className="space-y-6">
        <li>
          <H5>
            <Link
              href="http://unsi.nonip.net/"
              className="text-link hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              みんなの運指表
            </Link>
            <span className="ml-1">様</span>
          </H5>
        </li>
        <li>
          <H5>
            <Link
              href="https://typing-tube.net/"
              className="text-link hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              TypingTube
            </Link>
            <span className="ml-1">様</span>
          </H5>
        </li>
        <li>
          <H5>
            <Link
              href="https://github.com/jz5/namatyping"
              className="text-link hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              ニコ生タイピング
            </Link>
            <span className="ml-1">様</span>
          </H5>
        </li>
      </ul>
    </section>
  );
};
