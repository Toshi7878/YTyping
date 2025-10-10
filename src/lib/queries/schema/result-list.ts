import type { inferParserType } from "nuqs";
import {
  createLoader,
  createParser,
  createSerializer,
  parseAsInteger,
  parseAsNumberLiteral,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";
import * as z from "zod";
import { YOUTUBE_SPEEDS } from "@/lib/const";

const MODE = ["all", "roma", "kana", "romakana", "english"] as const;
export const ResultSearchParamsSchema = z.object({
  mode: z.literal(MODE).default("all"),
  minKpm: z.number(),
  maxKpm: z.number(),
  minClearRate: z.number(),
  maxClearRate: z.number(),
  minPlaySpeed: z.number(),
  maxPlaySpeed: z.number(),
  username: z.string().default(""),
  mapKeyword: z.string().default(""),
});

const KPM_SEARCH_RANGE = { min: 0, max: 1200 };
const parseAsKpm = createParser({
  parse(query) {
    const value = parseAsInteger.parse(query);
    if (value === null) return null;

    return Math.max(KPM_SEARCH_RANGE.min, Math.min(KPM_SEARCH_RANGE.max, value));
  },
  serialize(value: number) {
    return value.toFixed(0);
  },
});

const CLEAR_RATE_SEARCH_RANGE = { min: 0, max: 100 };
const parseAsClearRate = createParser({
  parse(query) {
    const value = parseAsInteger.parse(query);
    if (value === null) return null;

    return Math.max(CLEAR_RATE_SEARCH_RANGE.min, Math.min(CLEAR_RATE_SEARCH_RANGE.max, value));
  },
  serialize(value: number) {
    return value.toFixed(0);
  },
});

export const resultListSearchParams = {
  mode: parseAsStringLiteral(MODE),
  minKpm: parseAsKpm.withDefault(KPM_SEARCH_RANGE.min),
  maxKpm: parseAsKpm.withDefault(KPM_SEARCH_RANGE.max),
  minClearRate: parseAsClearRate.withDefault(CLEAR_RATE_SEARCH_RANGE.min),
  maxClearRate: parseAsClearRate.withDefault(CLEAR_RATE_SEARCH_RANGE.max),
  minPlaySpeed: parseAsNumberLiteral(YOUTUBE_SPEEDS).withDefault(1),
  maxPlaySpeed: parseAsNumberLiteral(YOUTUBE_SPEEDS).withDefault(2),
  username: parseAsString.withDefault(""),
  mapKeyword: parseAsString.withDefault(""),
};

export type ResultListSearchParams = inferParserType<typeof resultListSearchParams>;

export const loadResultListSearchParams = createLoader(resultListSearchParams);
export const resultListSerialize = createSerializer(resultListSearchParams);
