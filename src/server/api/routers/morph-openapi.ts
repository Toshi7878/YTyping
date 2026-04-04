import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { desc, eq, sql } from "drizzle-orm";
import type { OpenApiContentType } from "trpc-to-openapi";
import z from "zod";
import { env } from "@/env";
import { applyWordSymbolFilter } from "@/lib/word-symbol-filter";
import type { DBType } from "@/server/drizzle/client";
import { ReadingConversionDict } from "@/server/drizzle/schema";
import { tokenizeSentenceResultSchema, wordSymbolFilterOptionSchema } from "@/validator/morph/tokenize";
import { injectNewlinesIntoTokenArrays } from "../lib/morph-multiline-tokenize";
import { OPENAPI_RATE_LIMITS } from "../lib/rate-limit-config";
import { createRateLimitMiddleware, publicProcedure } from "../trpc";
import { normalizeSymbols } from "@/utils/string-transform";

const sudachiCoreResponseSchema = z.object({
  lyrics: z.array(z.string()),
  readings: z.array(z.string()),
});

export const morphOpenApiRouter = {
  tokenizeSentence: publicProcedure
    .use(createRateLimitMiddleware(OPENAPI_RATE_LIMITS["/morph/tokenize"].post))
    .meta({
      openapi: {
        method: "POST",
        path: "/morph/tokenize",
        protect: false,
        tags: ["Morph"],
        summary:
          'Tokenize Japanese sentence with readings (Sudachi + custom dictionary). One Sudachi request per call; newlines in input are reflected as a "\\n" entry in lyrics and readings when surfaces align with the original text.',
        contentTypes: ["application/json" as OpenApiContentType],
        errorResponses: {
          400: "Invalid input data",
          401: "Invalid or missing API key",
          429: "Too many requests",
          500: "Internal server error",
        },
      },
    })
    .input(
      z.object({
        sentence: z.string().min(1),
        apiKey: z.string().min(1),
        symbolFilter: wordSymbolFilterOptionSchema.default("non_symbol"),
      }),
    )
    .output(tokenizeSentenceResultSchema)
    .mutation(async ({ input, ctx }) => {
      const { db } = ctx;

      const sudachiUrl = env.SUDACHI_API_URL;
      const sudachiKey = env.SUDACHI_API_KEY;
      if (!sudachiUrl || !sudachiKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "読み変換用APIの環境変数が設定されていません",
        });
      }

      if (input.apiKey !== sudachiKey) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid API key" });
      }

      const dictionaryDict = await fetchDictionaryDict(db);
      const raw = await tokenizeSentenceWithSudachi({
        sentence: normalizeSymbols(input.sentence),
        apiUrl: sudachiUrl,
        apiKey: sudachiKey,
      });
      const tokenized = injectNewlinesIntoTokenArrays(input.sentence, raw.lyrics, raw.readings);

      const mergedAfterDict = applyDictionaryReadingsToTokenized(tokenized, dictionaryDict);
      const readingText = applyWordSymbolFilter({
        sentence: mergedAfterDict.readings.join(""),
        option: input.symbolFilter,
      });

      return { ...mergedAfterDict, readingText };
    }),
} satisfies TRPCRouterRecord;

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

    const data: unknown = await response.json();
    const parsed = sudachiCoreResponseSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error("Sudachi API の応答形式が不正です");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    console.error("形態素解析エラー:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "形態素解析中にエラーが発生しました。詳細はログを確認してください。",
    });
  }
}
