import { GetYouTubeMovieInfo } from "@/app/edit/ts/type";
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
  SafetySetting,
} from "@google/generative-ai";

import { NextResponse } from "next/server";

const safetySettings: SafetySetting[] = [
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },

  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

const TEXT_PROMPT = `以下のJSONデータ情報を解析して{musicTitle:string; artistName:string; musicSource:string; otherTags:string[];}の形式で出力してください。\n
  ボーカロイドや歌手とアーティストが異なる場合はmusicTitleにfeat.で歌っている人の名前を追加してください。musicTitleは曲名のみいれてください\n
  その曲の特に際立つアーティスト名をartistNameに追加してください。channelTitleはその曲のアーティスト名とは限りません。\n
  アニメ・ドラマ・映画のタイトルが存在する場合はmusicSourceに出力してください。括弧等を抜いた状態のタイトル名のみ出力してください。情報が見つかった場合のみ出力してください。\n
  descriptionなどに記載されているアーティストや曲に関連する単語をotherTagsに格納してください。otherTagsに格納する情報についてアーティストの所属するグループ名・単語などは重要です。\n
  出力するJSONデータはJSON.parseができるように改行を使用せずに出力してください。`;

export async function POST(req: Request) {
  const { prompt_post }: { prompt_post: GetYouTubeMovieInfo } = await req.json();
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

  const prompt = TEXT_PROMPT + JSON.stringify(prompt_post);

  const model = genAI.getGenerativeModel({
    model: "gemini-pro",
    safetySettings,
  });

  const result = await model.generateContentStream(prompt, {});
  const response = await result.response;

  return NextResponse.json({
    message: response.text(),
  });
}
