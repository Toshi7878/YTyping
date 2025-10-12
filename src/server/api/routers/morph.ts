import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { desc, eq, sql } from "drizzle-orm";
import z from "zod";
import { env } from "@/env";
import { FixWordEditLogs, ReadingConversionDict } from "@/server/drizzle/schema";
import { protectedProcedure } from "../trpc";

export const morphConvertRouter = {
  tokenizeSentence: protectedProcedure.input(z.object({ sentence: z.string().min(1) })).query(async ({ input }) => {
    if (env.SUDACHI_API_KEY && env.SUDACHI_API_URL) {
      return tokenizeSentenceWithSudachi({
        sentence: input.sentence,
        apiUrl: env.SUDACHI_API_URL,
        apiKey: env.SUDACHI_API_KEY,
      });
    }

    if (env.YAHOO_APP_ID) {
      return tokenizeSentenceWithYahoo(input.sentence);
    }

    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "読み変換用APIの環境変数が設定されていません" });
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

async function tokenizeSentenceWithSudachi({
  sentence,
  apiUrl,
  apiKey,
}: {
  sentence: string;
  apiUrl: string;
  apiKey: string;
}): Promise<{ lyrics: string[]; readings: string[] }> {
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
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

async function tokenizeSentenceWithYahoo(sentence: string): Promise<{ lyrics: string[]; readings: string[] }> {
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
  const lyrics: string[] = [];
  const readings: string[] = [];

  for (const token of data.tokens) {
    lyrics.push(token[0]); // surface (表層形)
    readings.push(token[1]); // reading (読み)
  }

  return { lyrics, readings };
}
