import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { env } from "@/env";
import type { YouTubeInfo } from "./youtube";

export const generateMapInfoWithGemini = async (youtubeInfo: YouTubeInfo) => {
  const google = createGoogleGenerativeAI({ apiKey: env.GCP_AUTH_KEY });

  const { text } = await generateText({
    model: google("gemini-flash-lite-latest"),
    providerOptions: {
      thinkingConfig: { thinkingLevel: "low" },
    },
    prompt: `YouTube Data API snippet 由来のJSON(下記)のみを根拠に、譜面作成用情報を抽出する。

出力はJSON文字列のみ(説明/Markdown/コードフェンス/改行は不可)。キーは固定:
{"title":string,"artistName":string,"source":string,"otherTags":string[],"originalTitle":string}

規則:
- title/artistName/source抽出優先: (1)「曲名 - アーティスト」「アーティスト - 曲名」等を分解 (2) 区切り文字(例:" - ","｜","|","／","/",":","：")で曲名らしい塊を選ぶ。
- titleは譜面表示用の曲名。入力からアレンジ/版情報(Nightcore/Remix/Arrange/Ver./Short等)が明確に取れる場合のみ、titleに " - " 区切りで付与してよい(捏造禁止)。
- originalTitleは曲そのもののタイトルのみ。titleや入力文字列から、アレンジ/版情報・装飾語・括弧内の補足(MV/歌詞/cover/歌ってみた/弾いてみた/踊ってみた/feat./remix/short ver等)を除いた「素の曲名」を入れる。素の曲名が取れない場合はtitleをそのまま入れる(空文字にしない)。
- artistNameはカバー曲の場合はカバーしたアーティストを埋める。
- より正式名称らしい表記を推測(より正式なtitle/artistName/sourceを推論できる場合は翻訳可能)
- 入力内に候補がある限り空文字は避け、入力内の語句の切り出し/正規化の範囲で最も可能性が高いものを埋める。
- 候補が皆無のキーのみ: title/artistName/sourceは""、otherTagsは[]。
- sourceは作品タイトル(アニメ/ドラマ/映画等)が明確に特定できた場合のみ。括弧や装飾は除いて作品名だけ。
- otherTagsは入力内の固有名詞を短い単語で重複なく最大10件。

入力JSON:
${JSON.stringify(youtubeInfo)}

出力JSON:`,
  });

  return text;
};
