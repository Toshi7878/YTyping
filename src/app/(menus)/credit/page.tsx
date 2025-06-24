import { Card, CardContent } from "@/components/ui/card";
import Link from "@/components/ui/link/link";

export default function Page() {
  return (
    <div className="mx-auto max-w-screen-xl space-y-4">
      <h1 className="text-3xl font-bold">クレジット</h1>
      <Card>
        <CardContent className="space-y-10">
          <BorrowedMaterials />
          <SpecialThanks />
        </CardContent>
      </Card>
    </div>
  );
}

const BorrowedMaterials = () => {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="mb-4 text-2xl font-semibold">お借りした素材</h2>
      <ul className="space-y-4">
        <li>
          <h3 className="mb-2 text-lg font-medium">
            <Link
              href="http://www.kurage-kosho.info/system.html"
              className="text-blue-500 underline hover:text-blue-600"
              target="_blank"
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
    </section>
  );
};

const SpecialThanks = () => {
  return (
    <section className="flex flex-col gap-2">
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
    </section>
  );
};
