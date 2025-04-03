import { z } from "@/validator/z";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory, SafetySetting } from "@google/generative-ai";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../trpc";

const TEXT_PROMPT = `以下のJSONデータ情報を解析して{musicTitle:string; artistName:string; musicSource:string; otherTags:string[];}の形式で出力してください。\n
  ボーカロイドや歌手とアーティストが異なる場合はmusicTitleにfeat.で歌っている人の名前を追加してください。musicTitleは曲名のみいれてください\n
  その曲の特に際立つアーティスト名をartistNameに追加してください。channelTitleはその曲のアーティスト名とは限りません。\n
  アニメ・ドラマ・映画のタイトルが存在する場合はmusicSourceに出力してください。括弧等を抜いた状態のタイトル名のみ出力してください。情報が見つかった場合のみ出力してください。\n
  descriptionなどに記載されているアーティストや曲に関連する単語をotherTagsに格納してください。otherTagsに格納する情報についてアーティストの所属するグループ名・単語などは重要です。\n
  出力するJSONデータはJSON.parseができるように改行を使用せずに出力してください。`;

const SAFETY_SETTINGS: SafetySetting[] = [
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },

  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

const MODEL = "gemini-1.5-pro";
const GCP_API_KEY = process.env.GCP_AUTH_KEY as string;

interface GeminiMapInfo {
  musicTitle: string;
  artistName: string;
  musicSource: string;
  otherTags: string[];
}

export const geminiRouter = {
  generateMapInfo: protectedProcedure.input(z.object({ videoId: z.string().length(11) })).query(async ({ input }) => {
    const genAI = new GoogleGenerativeAI(GCP_API_KEY);

    const model = genAI.getGenerativeModel({
      model: MODEL,
      safetySettings: SAFETY_SETTINGS,
    });

    try {
      const youtubeInfo = await getYouTubeInfo(input.videoId);
      const prompt = TEXT_PROMPT + JSON.stringify(youtubeInfo);

      const result = await model.generateContentStream(prompt, {});
      const response = await result.response;
      const responseText = response.text();

      return cleanJsonResponse(responseText);
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "譜面情報の生成に失敗しました",
      });
    }
  }),
};

const cleanJsonResponse = (responseText: string): GeminiMapInfo => {
  let jsonData = responseText;

  if (responseText.includes("```json")) {
    jsonData = responseText.replace(/```json\n|\n```/g, "");
  } else if (responseText.includes("```")) {
    jsonData = responseText.replace(/```\n|\n```/g, "");
  }

  return JSON.parse(jsonData.trim());
};

interface YouTubeInfo {
  channelTitle: string;
  description: string;
  title: string;
  tags: string[];
}

const getYouTubeInfo = async (videoId: string): Promise<YouTubeInfo> => {
  try {
    const videoResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${GCP_API_KEY}`
    );

    if (!videoResponse.ok) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `YouTube APIエラー: ${videoResponse.status}`,
      });
    }

    const videoData = await videoResponse.json();

    if (!videoData.items || videoData.items.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "動画が見つかりませんでした",
      });
    }

    const { channelTitle, description, title, tags = [] } = videoData.items[0].snippet;
    return { channelTitle, description, title, tags };
  } catch (error) {
    if (error instanceof TRPCError) throw error;

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "YouTube情報の取得に失敗しました",
    });
  }
};
