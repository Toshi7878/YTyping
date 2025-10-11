import type { TRPCRouterRecord } from "@trpc/server";
import { desc, eq, sql } from "drizzle-orm";
import z from "zod";
import { env } from "@/env";
import { FixWordEditLogs, ReadingConversionDict } from "@/server/drizzle/schema";
import { protectedProcedure } from "../trpc";

export const morphConvertRouter = {
  tokenizeSentence: protectedProcedure.input(z.object({ sentence: z.string().min(1) })).query(async ({ input }) => {
    return postTokenizeSentence(input.sentence);
  }),

  getCustomDict: protectedProcedure.query(async ({ ctx }) => {
    const dictionaryDict = await ctx.db
      .select({
        surface: ReadingConversionDict.surface,
        reading: ReadingConversionDict.reading,
      })
      .from(ReadingConversionDict)
      .where(eq(ReadingConversionDict.type, "DICTIONARY"))
      .orderBy(desc(sql`char_length(${ReadingConversionDict.surface})`));

    const regexDict = await ctx.db
      .select({
        surface: ReadingConversionDict.surface,
        reading: ReadingConversionDict.reading,
      })
      .from(ReadingConversionDict)
      .where(eq(ReadingConversionDict.type, "REGEX"))
      .orderBy(desc(sql`char_length(${ReadingConversionDict.surface})`));

    return { dictionaryDict, regexDict };
  }),

  fixWordLog: protectedProcedure
    .input(z.object({ lyrics: z.string(), word: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { lyrics, word } = input;

      await ctx.db.insert(FixWordEditLogs).values({ lyrics, word });
    }),
} satisfies TRPCRouterRecord;

async function postTokenizeSentence(sentence: string): Promise<{ lyrics: string[]; readings: string[] }> {
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

// async function fetchYahooMorphAnalysis(sentence: string): Promise<string> {
//   const apiKey = env.YAHOO_APP_ID;
//   const apiUrl = "https://jlp.yahooapis.jp/MAService/V2/parse";

//   const response = await fetch(apiUrl, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "User-Agent": `Yahoo AppID: ${apiKey}`,
//     },
//     body: JSON.stringify({
//       id: apiKey,
//       jsonrpc: "2.0",
//       method: "jlp.maservice.parse",
//       params: {
//         q: sentence,
//         results: "ma",
//         response: {
//           surface: true,
//           reading: true,
//           pos: false,
//           baseform: false,
//         },
//       },
//     }),
//   });

//   const data = await response.json();
//   return data.tokens.map((char: string) => char[1]).join("");
// }
