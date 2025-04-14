import { z } from "@/validator/z";
import { protectedProcedure } from "../trpc";

const AWS_API = {
  FUGASHI_UNIDIC: {
    apiKey: process.env.FUGASHI_UNIDIC_API_KEY as string,
    url: "https://0bwyiswewg.execute-api.ap-northeast-1.amazonaws.com/dev/fugashi-unidic/parse",
  },
  SUDACHI_FULL: {
    apiKey: process.env.SUDACHI_FULL_API_KEY as string,
    url: "https://wdso812r5e.execute-api.ap-northeast-1.amazonaws.com/dev/sudachi-full/parse",
  },
} as const;

export const morphConvertRouter = {
  getKanaWordAws: protectedProcedure.input(z.object({ sentence: z.string().min(1) })).query(async ({ input }) => {
    return await postAwsLambdaMorphApi(input.sentence);
  }),

  getKanaWordYahoo: protectedProcedure.input(z.object({ sentence: z.string().min(1) })).query(async ({ input }) => {
    return await fetchYahooMorphAnalysis(input.sentence);
  }),

  getCustomDic: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.morph_convert_kana_dic.findMany();

    return result.sort((a, b) => b.surface.length - a.surface.length);
  }),

  registerCustomDic: protectedProcedure
    .input(z.object({ surface: z.string().min(2), reading: z.string().min(2) }))
    .mutation(async ({ input, ctx }) => {
      const { surface, reading } = input;

      await ctx.db.morph_convert_kana_dic.create({
        data: {
          surface,
          reading,
        },
      });

      return { success: true };
    }),

  post_fix_word_log: protectedProcedure
    .input(z.object({ lyrics: z.string().min(2), word: z.string().min(2) }))
    .mutation(async ({ input, ctx }) => {
      const { lyrics, word } = input;

      await ctx.db.fix_word_edit_logs.create({
        data: {
          lyrics,
          word,
        },
      });

      return { success: true };
    }),
};

async function postAwsLambdaMorphApi(sentence: string): Promise<{ lyrics: string[]; reading: string[] }> {
  const { apiKey, url } = AWS_API["SUDACHI_FULL"];

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: sentence,
    });

    if (!response.ok) {
      throw new Error(`API エラー: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("形態素解析エラー:", error);
    throw new Error("形態素解析中にエラーが発生しました。詳細はログを確認してください。");
  }
}

async function fetchYahooMorphAnalysis(sentence: string): Promise<string> {
  const apiKey = process.env.YAHOO_APP_ID as string;
  const apiUrl = "https://jlp.yahooapis.jp/MAService/V2/parse";

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": `Yahoo AppID: ${apiKey}`,
    },
    body: JSON.stringify({
      id: apiKey,
      jsonrpc: "2.0",
      method: "jlp.maservice.parse",
      params: {
        q: sentence,
        results: "ma",
        response: {
          surface: true,
          reading: true,
          pos: false,
          baseform: false,
        },
      },
    }),
  });

  const data = await response.json();
  return data.tokens.map((char: string) => char[1]).join("");
}
