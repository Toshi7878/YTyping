import type { inferParserType } from "nuqs";
import {
  createLoader,
  createParser,
  createSerializer,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";
import {
  MAP_DIFFICULTY_RATE_FILTER_LIMIT,
  MAP_RANKING_STATUS_FILTER_OPTIONS,
  MAP_SORT_OPTIONS,
  MAP_USER_FILTER_OPTIONS,
} from "@/validator/map-list";

const parseAsSort = createParser({
  parse(query): { value: (typeof MAP_SORT_OPTIONS)[number]; desc: boolean } | null {
    const [value = "", direction = ""] = query.split(":");
    const desc = parseAsStringLiteral(["asc", "desc"]).parse(direction) ?? "desc";

    if (!MAP_SORT_OPTIONS.includes(value as (typeof MAP_SORT_OPTIONS)[number])) return null;

    return { value: value as (typeof MAP_SORT_OPTIONS)[number], desc: desc === "desc" };
  },
  serialize({ value, desc }: { value: (typeof MAP_SORT_OPTIONS)[number]; desc: boolean }) {
    return `${value}:${desc ? "desc" : "asc"}`;
  },
});

const parseAsDifficultyRate = createParser({
  parse(query) {
    const value = parseAsFloat.parse(query);
    if (value === null) return null;

    const rounded = Math.round(value * 10) / 10;
    return Math.max(0, Math.min(12, rounded));
  },
  serialize(value: number) {
    return value.toFixed(1);
  },
});

export const mapListSearchParams = {
  sort: parseAsSort.withDefault({ value: "id", desc: true }),
  keyword: parseAsString.withDefault(""),
  minRate: parseAsDifficultyRate.withDefault(MAP_DIFFICULTY_RATE_FILTER_LIMIT.min),
  maxRate: parseAsDifficultyRate.withDefault(MAP_DIFFICULTY_RATE_FILTER_LIMIT.max),
  filter: parseAsStringLiteral(MAP_USER_FILTER_OPTIONS),
  rankingStatus: parseAsStringLiteral(MAP_RANKING_STATUS_FILTER_OPTIONS),
  bookmarkListId: parseAsInteger,
};

export type MapListSearchParams = inferParserType<typeof mapListSearchParams>;

export const loadMapListSearchParams = createLoader(mapListSearchParams);
export const mapListSerialize = createSerializer(mapListSearchParams);
