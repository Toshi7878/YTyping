import type { Route } from "next";
import { CardWithContent } from "@/components/ui/card";
import { H1, H2, Large, LinkText, UList } from "@/components/ui/typography";

export default function Page() {
  return (
    <div className="mx-auto max-w-screen-xl space-y-4">
      <H1>クレジット</H1>
      <BorrowedMaterials />
      <SpecialThanks />
    </div>
  );
}

const BORROWED_MATERIALS = [
  {
    name: "くらげ工匠",
    url: "http://www.kurage-kosho.info/system.html",
    materials: ["打鍵音 ボタン58", "ミス音 ボタン40", "打ち切り音 ボタン68"],
  },
];

const BorrowedMaterials = () => {
  return (
    <CardWithContent>
      <H2>お借りした素材</H2>
      <UList
        className="list-none ml-2"
        items={BORROWED_MATERIALS.map(({ name, url, materials }) => (
          <div key={name}>
            <Large className="flex">
              <LinkText href={url as Route} target="_blank" rel="noopener noreferrer">
                {name}
              </LinkText>
              <span className="ml-1">様</span>
            </Large>
            <UList items={materials.map((material) => <div key={material}>{material}</div>)} />
          </div>
        ))}
      />
    </CardWithContent>
  );
};

const SPECIAL_THANKS = [
  {
    name: "みんなの運指表",
    url: "http://unsi.nonip.net/",
  },
  {
    name: "TypingTube",
    url: "https://typing-tube.net/",
  },
  {
    name: "ニコ生タイピング",
    url: "https://github.com/jz5/namatyping",
  },
];

const SpecialThanks = () => {
  return (
    <CardWithContent>
      <H2>スペシャルサンクス</H2>
      <UList
        className="list-none ml-2 space-y-5"
        items={SPECIAL_THANKS.map(({ name, url }) => (
          <Large className="flex" key={name}>
            <LinkText href={url as Route} target="_blank" rel="noopener noreferrer">
              {name}
            </LinkText>
            <span className="ml-1">様</span>
          </Large>
        ))}
      />
    </CardWithContent>
  );
};
