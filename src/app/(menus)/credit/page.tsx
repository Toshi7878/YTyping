import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">クレジット</h1>
      <Card>
        <BorrowedMaterials />
        <SpecialThanks />
      </Card>
    </div>
  );
}

const BorrowedMaterials = () => {
  return (
    <CardContent className="flex flex-col gap-2">
      <h2 className="mb-4 text-2xl font-semibold">お借りした素材</h2>
      <ul className="space-y-4">
        <li>
          <h3 className="mb-2 text-lg font-medium">
            <Link
              href="http://www.kurage-kosho.info/system.html"
              className="text-blue-500 underline hover:text-blue-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              くらげ工匠
            </Link>
            <span className="ml-1">様</span>
          </h3>
          <div className="flex flex-col pl-4">
            <p>・打鍵音 ボタン58</p>
            <p>・ミス音 ボタン40</p>
            <p>・打ち切り音 ボタン68</p>
          </div>
        </li>
      </ul>
    </CardContent>
  );
};

const SpecialThanks = () => {
  return (
    <CardContent className="flex flex-col gap-2">
      <h2 className="mb-4 text-2xl font-semibold">スペシャルサンクス</h2>
      <ul className="space-y-8">
        <li>
          <h3 className="text-lg font-medium">
            <Link
              href="http://unsi.nonip.net/"
              className="text-blue-500 underline hover:text-blue-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              みんなの運指表
            </Link>
            <span className="ml-1">様</span>
          </h3>
        </li>
        <li>
          <h3 className="text-lg font-medium">
            <Link
              href="https://typing-tube.net/"
              className="text-blue-500 underline hover:text-blue-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              TypingTube
            </Link>
            <span className="ml-1">様</span>
          </h3>
        </li>
        <li>
          <h3 className="text-lg font-medium">
            <Link
              href="https://github.com/jz5/namatyping"
              className="text-blue-500 underline hover:text-blue-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              ニコ生タイピング
            </Link>
            <span className="ml-1">様</span>
          </h3>
        </li>
      </ul>
    </CardContent>
  );
};
