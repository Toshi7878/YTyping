import { type inferParserType, useQueryStates } from "nuqs";
import {
  createLoader,
  createParser,
  createSerializer,
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
} from "@/validator/result";

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

export type ResultListSearchParams = inferParserType<typeof resultListSearchParams>;

export const loadResultListSearchParams = createLoader(resultListSearchParams);
export const resultListSerialize = createSerializer(resultListSearchParams);
