import { env } from "@/env";
import z from "zod";
import { protectedProcedure } from "../trpc";

export const morphConvertRouter = {
  tokenizeWordAws: protectedProcedure.input(z.object({ sentence: z.string().min(1) })).query(async ({ input }) => {
    return await postAwsLambdaMorphApi(input.sentence);
  }),

  getKanaWordYahoo: protectedProcedure.input(z.object({ sentence: z.string().min(1) })).query(async ({ input }) => {
    return await fetchYahooMorphAnalysis(input.sentence);
  }),

  getCustomDic: protectedProcedure.query(async ({ ctx }) => {
    const customDic = await ctx.db.morph_convert_kana_dic.findMany({ where: { type: "DICTIONARY" } });
    const customRegexDic = await ctx.db.morph_convert_kana_dic.findMany({ where: { type: "REGEX" } });

    return { customDic, customRegexDic };
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

async function postAwsLambdaMorphApi(sentence: string): Promise<{ lyrics: string[]; readings: string[] }> {
  try {
    const response = await fetch(env.SUDACHI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.SUDACHI_API_KEY,
      },
      body: JSON.stringify({ text: sentence }),
    });

    if (!response.ok) {
      throw new Error(`API エラー: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("形態素解析エラー:", error);
    throw new Error("形態素解析中にエラーが発生しました。詳細はログを確認してください。");
  }
}

async function fetchYahooMorphAnalysis(sentence: string): Promise<string> {
  const apiKey = env.YAHOO_APP_ID;
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
