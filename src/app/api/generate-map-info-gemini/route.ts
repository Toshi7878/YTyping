import { GetYouTubeMovieInfo } from "@/app/edit/ts/type";
import { GoogleGenerativeAI, SafetySetting } from "@google/generative-ai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

import { NextResponse } from "next/server";

const safetySettings: SafetySetting[] = [
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },

  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

const TEXT_PROMPT = `以下のJSONデータ情報を解析して{musicTitle:string, artistName:string, otherTags:string[]}の形式で出力してください。\n
  ただし、channelTitleはその曲のアーティスト名とは限りません。\n
  歌ってみたやカバー曲の場合は出力するmusicTitleの末尾に (Cover)を追加してください\n
  featが付く場合はmusicTitleにfeatを追加してください\n
  descriptionなどに記載されているアーティストや曲に関連する単語をotherTagsに格納してください。アーティストの所属するグループ名や映画・ドラマ・アニメのタイトルは重要です。\n
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
