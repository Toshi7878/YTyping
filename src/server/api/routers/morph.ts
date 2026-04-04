import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { desc, eq, sql } from "drizzle-orm";
import z from "zod";
import { env } from "@/env";
import { applyWordSymbolFilter } from "@/lib/word-symbol-filter";
import type { DBType } from "@/server/drizzle/client";
import { FixWordEditLogs, ReadingConversionDict } from "@/server/drizzle/schema";
import {
  tokenizeSentenceResultSchema,
  wordSymbolFilterOptionSchema,
} from "@/validator/morph/tokenize";
import { injectNewlinesIntoTokenArrays } from "../lib/morph-multiline-tokenize";
import { protectedProcedure } from "../trpc";

const tokenizeInputSchema = z.object({
  sentence: z.string().min(1),
  symbolFilter: wordSymbolFilterOptionSchema.default("add_symbol_all"),
});

const fetchDictionaryDict = async (db: DBType) => {
  return db
    .select({
      surface: ReadingConversionDict.surface,
      reading: ReadingConversionDict.reading,
    })
    .from(ReadingConversionDict)
    .where(eq(ReadingConversionDict.type, "DICTIONARY"))
    .orderBy(desc(sql`char_length(${ReadingConversionDict.surface})`));
};

const fetchRegexDict = async (db: DBType) => {
  return db
    .select({
      surface: ReadingConversionDict.surface,
      reading: ReadingConversionDict.reading,
    })
    .from(ReadingConversionDict)
    .where(eq(ReadingConversionDict.type, "REGEX"))
    .orderBy(desc(sql`char_length(${ReadingConversionDict.surface})`));
};

function applyDictionaryReadingsToTokenized(
  tokenized: { lyrics: string[]; readings: string[] },
  dictionaryDict: { surface: string; reading: string }[],
): { lyrics: string[]; readings: string[] } {
  let result = tokenized;

  for (const { surface, reading } of dictionaryDict) {
    const matchIndexes: number[] = [];

    for (const [index, lyric] of result.lyrics.entries()) {
      if (lyric === surface) {
        matchIndexes.push(index);
      }
    }

    if (matchIndexes.length > 0) {
      const newReadings = [...result.readings];
      for (const index of matchIndexes) {
        newReadings[index] = reading;
      }
      result = { ...result, readings: newReadings };
    }
  }

  return result;
}

export const morphRouter = {
  tokenizeSentence: protectedProcedure
    .input(tokenizeInputSchema)
    .output(tokenizeSentenceResultSchema)
    .query(async ({ input, ctx }) => {
      const dictionaryDict = await fetchDictionaryDict(ctx.db);

      const sudachiUrl = env.SUDACHI_API_URL;
      const sudachiKey = env.SUDACHI_API_KEY;
      let tokenized: { lyrics: string[]; readings: string[] };
      if (sudachiKey && sudachiUrl) {
        const raw = await tokenizeSentenceWithSudachi({
          sentence: input.sentence,
          apiUrl: sudachiUrl,
          apiKey: sudachiKey,
        });
        tokenized = injectNewlinesIntoTokenArrays(input.sentence, raw.lyrics, raw.readings);
      } else if (env.YAHOO_APP_ID) {
        const yahooResult = await tokenizeSentenceWithYahoo(input.sentence);
        tokenized = injectNewlinesIntoTokenArrays(input.sentence, yahooResult.lyrics, yahooResult.readings);
      } else {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "読み変換用APIの環境変数が設定されていません" });
      }

      const mergedAfterDict = applyDictionaryReadingsToTokenized(tokenized, dictionaryDict);
      const readingText = applyWordSymbolFilter({
        sentence: mergedAfterDict.readings.join(""),
        option: input.symbolFilter,
        filterType: "wordConvert",
      });

      return { ...mergedAfterDict, readingText };
    }),

  getCustomDict: protectedProcedure.query(async ({ ctx }) => {
    const dictionaryDict = await fetchDictionaryDict(ctx.db);
    const regexDict = await fetchRegexDict(ctx.db);

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

  for (const token of data.result.tokens) {
    lyrics.push(token[0]); // surface (表層形)
    readings.push(token[1]); // reading (読み)
  }

  return { lyrics, readings };
}
