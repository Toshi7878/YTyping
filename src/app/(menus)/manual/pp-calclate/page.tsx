import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader } from "@/ui/card";
import { H1, H2 } from "@/ui/typography";
import { DifficultySteps, PPSteps } from "./steps";

export default function Page() {
  return (
    <article className="mx-auto max-w-7xl space-y-4">
      <H1>譜面難易度とPP計算方法</H1>
      <Card>
        <CardHeader>
          <H2>難易度 (Rating)</H2>
          <CardDescription>
            各曲のタイピング難易度を数値化したものです。KPMや文字の多様性をもとに算出されます。
            <br />
            ※計算方法は見直し変更される可能性があります。
            <div className="flex items-center gap-x-2">
              <span>ソースコード:</span>
              <Link
                href="https://github.com/Toshi7878/YTyping/blob/main/src/server/api/routers/map/rating.ts"
                className="text-primary-light text-sm hover:underline"
              >
                rating.ts
              </Link>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DifficultySteps />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <H2>PP (Performance Points)</H2>
          <CardDescription>
            プレイ結果から算出されるポイントです。精度・クリア率・速度・難易度が総合的に評価されます。
            <br />
            ※計算方法は見直し変更される可能性があります。
            ※PP初回算出時2026-4-22以前の譜面が後から更新されたリザルトはratingが不明なため0ppになっています。
            <div className="flex items-center gap-x-2">
              <span>ソースコード:</span>
              <Link
                href="https://github.com/Toshi7878/YTyping/blob/main/src/lib/pp.ts"
                className="text-primary-light text-sm hover:underline"
              >
                pp.ts
              </Link>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PPSteps />
        </CardContent>
      </Card>
    </article>
  );
}
