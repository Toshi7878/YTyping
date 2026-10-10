import { type inferParserType, useQueryState, useQueryStates } from "nuqs";
import {
  createLoader,
  createParser,
  parseAsInteger,
  parseAsNumberLiteral,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";
import {
  CLEAR_RATE_LIMIT,
  KPM_LIMIT,
  PLAY_SPEED_LIMIT,
  RESULT_INPUT_METHOD_TYPES,
  RESULT_PLAY_SPEEDS,
  RESULT_SORT_OPTIONS,
} from "@/validator/result/list";

const parseAsKpm = createParser({
  parse(query) {
    const value = parseAsInteger.parse(query);
    if (value === null) return null;

    return Math.max(KPM_LIMIT.min, Math.min(KPM_LIMIT.max, value));
  },
  serialize(value: number) {
    return value.toFixed(0);
  },
});

const parseAsClearRate = createParser({
  parse(query) {
    const value = parseAsInteger.parse(query);
    if (value === null) return null;

    return Math.max(CLEAR_RATE_LIMIT.min, Math.min(CLEAR_RATE_LIMIT.max, value));
  },
  serialize(value: number) {
    return value.toFixed(0);
  },
});

const parseAsSort = createParser({
  parse(query): { type: (typeof RESULT_SORT_OPTIONS)[number]; isDesc: boolean } | null {
    const [type = "", direction = ""] = query.split(":");
    const isDesc = parseAsStringLiteral(["asc", "desc"]).parse(direction) ?? "desc";

    if (!RESULT_SORT_OPTIONS.includes(type as (typeof RESULT_SORT_OPTIONS)[number])) return null;

    return { type: type as (typeof RESULT_SORT_OPTIONS)[number], isDesc: isDesc === "desc" };
  },
  serialize({ type, isDesc }: { type: (typeof RESULT_SORT_OPTIONS)[number]; isDesc: boolean }) {
    return `${type}:${isDesc ? "desc" : "asc"}`;
  },
});

const resultListSortParser = parseAsSort.withDefault({ type: "updatedAt", isDesc: true });

const resultListSearchParams = {
  mode: parseAsStringLiteral(RESULT_INPUT_METHOD_TYPES),
  minKpm: parseAsKpm.withDefault(KPM_LIMIT.min),
  maxKpm: parseAsKpm.withDefault(KPM_LIMIT.max),
  minClearRate: parseAsClearRate.withDefault(CLEAR_RATE_LIMIT.min),
  maxClearRate: parseAsClearRate.withDefault(CLEAR_RATE_LIMIT.max),
  minPlaySpeed: parseAsNumberLiteral(RESULT_PLAY_SPEEDS).withDefault(PLAY_SPEED_LIMIT.min),
  maxPlaySpeed: parseAsNumberLiteral(RESULT_PLAY_SPEEDS).withDefault(PLAY_SPEED_LIMIT.max),
  username: parseAsString.withDefault(""),
  mapKeyword: parseAsString.withDefault(""),
};

export const useResultListFilterQueryStates = () => useQueryStates(resultListSearchParams);
export const useResultListSortQueryState = () => useQueryState("sort", resultListSortParser);
export const loadResultListSearchParams = createLoader({ ...resultListSearchParams, sort: resultListSortParser });

export type ResultListSortSearchParams = inferParserType<typeof resultListSortParser>;
