import { ExternalLink } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Separator } from "@/ui/separator";
import { H3, OList, P } from "@/ui/typography";

function FormulaBlock({ children }: { children: ReactNode }) {
  return (
    <div className="my-2 whitespace-pre-wrap rounded-md bg-accent px-4 py-2 font-mono text-sm leading-relaxed">
      {children}
    </div>
  );
}

function StepList({ steps }: { steps: { title: string; content: ReactNode; links?: string[] }[] }) {
  return (
    <OList
      className="list-inside list-decimal space-y-6"
      listClassName="marker:text-lg marker:font-semibold"
      items={steps.map((step, i) => (
        <>
          <H3 className="inline">{step.title}</H3>
          {step.links?.map((link, j) => (
            <Link
              // biome-ignore lint/suspicious/noArrayIndexKey: 静的なlistで使用する
              key={j}
              href={link as Route}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 inline-flex items-center gap-1 align-middle text-muted-foreground text-xs hover:text-primary"
            >
              <ExternalLink size={12} />
              コード
            </Link>
          ))}
          {step.content}
          {i !== steps.length - 1 && <Separator className="my-4" />}
        </>
      ))}
    />
  );
}

export function DifficultySteps() {
  const RATING_URL = "https://github.com/Toshi7878/YTyping/blob/main/src/server/api/routers/map/rating.ts";
  const steps = [
    {
      title: "KPMの算出",
      links: [`${RATING_URL}#L69`],
      content: (
        <>
          <P>各行のローマ字KPM（Keys Per Minute）を計算します。1700 KPMを超える行は異常値として除外されます。</P>
          <FormulaBlock>KPM = (行のノーツ数 ÷ 行の時間) × 60</FormulaBlock>
        </>
      ),
    },
    {
      title: "文字多様性スコア (Diversity)",
      links: [`${RATING_URL}#L26-L40`],
      content: (
        <>
          <P>
            行毎のワードの文字分布をシャノンエントロピーで評価し、0〜1の多様性スコアを算出します。
            「あああ…」のように同じ文字が続く行ほどスコアが低くなります。
          </P>
          <FormulaBlock>
            {"diversity = H(文字分布) / log₂(文字数)\n※ 全文字が同じ → 0、全文字が異なる → 1 に近い"}
          </FormulaBlock>
        </>
      ),
    },
    {
      title: "多様性ペナルティの適用",
      links: [`${RATING_URL}#L48-L51`],
      content: (
        <>
          <P>
            多様性スコアが閾値(0.6)未満の行は KPM を指数的に減衰させます。同じ文字の連打が多い行の難易度を補正します。
          </P>
          <FormulaBlock>
            {"diversity ≥ 0.6  →  ペナルティなし (× 1.0)\ndiversity < 0.6  →  adjustedKPM = KPM × (diversity / 0.6)²"}
          </FormulaBlock>
        </>
      ),
    },
    {
      title: "難易度スコアの計算 (difficultyScore)",
      links: [`${RATING_URL}#L84-L96`],
      content: (
        <>
          <P>
            ノーツ数で重み付けした加重平均KPMと、調整済みKPMが高い上位2行の平均（ピークKPM）を 7:3
            の比率で合成して難易度スコアを算出します。
          </P>
          <FormulaBlock>
            {
              "avgKPM  = Σ(adjustedKPM × notes割合)\npeakKPM = 上位2行の adjustedKPM の平均\ndifficultyScore = avgKPM × 0.7 + peakKPM × 0.3"
            }
          </FormulaBlock>
        </>
      ),
    },
    {
      title: "ノーツ数補正",
      links: [`${RATING_URL}#L58-L60`],
      content: (
        <>
          <P>
            総ノーツ数 270 を基準に対数スケールで補正します。ノーツが少ない曲は低め、多い曲は高め（上限 ×1.1
            倍）に調整されます。
          </P>
          <FormulaBlock>{"notesScaling = clamp(1.0 + log(totalNotes / 270) × 0.17,  min=0,  max=1.1)"}</FormulaBlock>
        </>
      ),
    },
    {
      title: "難易度",
      links: [`${RATING_URL}#L101`],
      content: (
        <>
          <P>難易度スコアを 100 で割り、ノーツ補正を乗算して最終的な難易度を算出します。</P>
          <FormulaBlock>{"rating = (difficultyScore / 100) × notesScaling"}</FormulaBlock>
        </>
      ),
    },
  ];

  return <StepList steps={steps} />;
}

export function PPSteps() {
  const PP_URL = "https://github.com/Toshi7878/YTyping/blob/main/src/lib/pp.ts";
  const HELPER_URL = "https://github.com/Toshi7878/YTyping/blob/main/src/lib/build-map/built-map-helper.ts";
  const MISS_URL =
    "https://github.com/Toshi7878/YTyping/blob/main/src/app/(typing)/type/_feature/typing-card/playing/update-status/miss.ts";
  const SAVE_LINE_URL =
    "https://github.com/Toshi7878/YTyping/blob/main/src/app/(typing)/type/_feature/typing-card/playing/save-line-result.ts";
  const steps = [
    {
      title: "Base PP",
      links: [`${PP_URL}#L13-L15`],
      content: (
        <>
          <P>難易度から基礎となる PP を算出します。 rating…難易度</P>
          <FormulaBlock>{"basePP = rating × 100"}</FormulaBlock>
        </>
      ),
    },
    {
      title: "クリア率 (Clear Rate) 補正",
      links: [`${HELPER_URL}#L111-L116`, `${MISS_URL}#L19-L24`, `${SAVE_LINE_URL}#L41-L44`, `${PP_URL}#L36-L40`],
      content: (
        <>
          <P>
            100%の割合からミスと打ち損じの打数に応じて減算します。かな入力でもローマ字換算で計算します。
            <br />
            totalNotes…総ローマ字ノーツ数、missCount…ミス数、lostNotes…打ち損じノーツ数、keyRate…100/totalNotes、missRate…keyRateの1/2
          </P>
          <FormulaBlock>
            {
              "keyRate  = 100 / totalNotes\nmissRate = keyRate / 2\n\nclearRate = 100 − missCount × missRate − lostNotes × keyRate"
            }
          </FormulaBlock>
          <P>
            クリア率のべき乗で補正します。難易度が高いほど指数が小さくなり、低クリア率でも PP が出やすくなります。
            <br />
            clearRate…クリア率、exp…補正係数
          </P>
          <FormulaBlock>
            {
              "exp = 1.2 + 1.0 / (1 + rating / 8)\n  rating=0  → exp≈2.2\n  rating=5  → exp≈1.7\n  rating=10 → exp≈1.53\n\n補正係数 = clearRate ^ exp"
            }
          </FormulaBlock>
        </>
      ),
    },
    {
      title: "正確率 (Accuracy) 補正",
      links: [`${PP_URL}#L56-L85`],
      content: (
        <>
          <P>
            タイプ成功数 ÷（タイプ数 + ミス数）で正確率を算出し、2乗で補正します。 正確率が落ちるほど PP
            が大きく減少します。
            <br />
            accuracy…正確率、type…タイプ数、miss…ミス数
          </P>
          <FormulaBlock>{"accuracy = type / (type + miss)\n補正係数 = accuracy²"}</FormulaBlock>
        </>
      ),
    },
    {
      title: "速度補正",
      links: [`${PP_URL}#L22-L25`],
      content: (
        <>
          <P>再生速度 1.0 以上で補正が上昇し、最大 1.5 倍まで加算されます。(再生速度1.0 未満はランキング登録不可)</P>
          <FormulaBlock>{"speedMultiplier = min(1 + (speed - 1) × 0.5,  max=1.5)"}</FormulaBlock>
        </>
      ),
    },
    {
      title: "譜面リザルトのPP値",
      links: [`${PP_URL}#L87-L95`],
      content: (
        <>
          <P>各スコアの PP 値を算出します。</P>
          <FormulaBlock>{"rawPP = basePP × accuracy² × clearRate^exp × speedMultiplier"}</FormulaBlock>
        </>
      ),
    },
    {
      title: "実力ランキングの合計PP",
      links: [`${PP_URL}#L100-L108`],
      content: (
        <>
          <P>
            全スコアの PP から上位 200 件を選び、ランク順に 0.95 ずつ減衰をかけて合算します。
            1位のスコアが最大に寄与し、順位が下がるほど貢献度が小さくなります。
          </P>
          <FormulaBlock>{"totalPP = Σ pp[i] × 0.95^i   (i = 0〜199、上位200件)"}</FormulaBlock>
        </>
      ),
    },
  ];

  return <StepList steps={steps} />;
}
