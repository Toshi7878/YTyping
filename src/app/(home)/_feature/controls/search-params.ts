import { type inferParserType, useQueryState, useQueryStates } from "nuqs";
import {
  createLoader,
  createParser,
  createSerializer,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";
import { MAP_RANKING_STATUS_FILTER_OPTIONS, MAP_SORT_OPTIONS, MAP_USER_FILTER_OPTIONS } from "@/validator/map/list";

const parseAsSort = createParser({
  parse(query): { type: (typeof MAP_SORT_OPTIONS)[number]; isDesc: boolean } | null {
    const [type = "", direction = ""] = query.split(":");
    const isDesc = parseAsStringLiteral(["asc", "desc"]).parse(direction) ?? "desc";

    if (!MAP_SORT_OPTIONS.includes(type as (typeof MAP_SORT_OPTIONS)[number])) return null;

    return { type: type as (typeof MAP_SORT_OPTIONS)[number], isDesc: isDesc === "desc" };
  },
  serialize({ type, isDesc }: { type: (typeof MAP_SORT_OPTIONS)[number]; isDesc: boolean }) {
    return `${type}:${isDesc ? "desc" : "asc"}`;
  },
});

const parseAsDifficultyRate = createParser({
  parse(query) {
    const value = parseAsFloat.parse(query);
    if (value === null) return null;

    const rounded = Math.round(value * 100) / 100;
    return Math.max(0, rounded);
  },
  serialize(value: number) {
    return value.toFixed(2);
  },
});

const mapListFilterParsers = {
  keyword: parseAsString.withDefault(""),
  minRate: parseAsDifficultyRate.withDefault(0),
  maxRate: parseAsDifficultyRate,
  filterType: parseAsStringLiteral(MAP_USER_FILTER_OPTIONS),
  rankingStatus: parseAsStringLiteral(MAP_RANKING_STATUS_FILTER_OPTIONS),
  maxKanaChunkCount: parseAsInteger,
  minAlphabetChunkCount: parseAsInteger,
  bookmarkListId: parseAsInteger,
};
const mapListSortParser = parseAsSort.withDefault({ type: "publishedAt", isDesc: true });

export const useMapListFilterQueryStates = () => useQueryStates(mapListFilterParsers);
export const useMapListSortQueryState = () => useQueryState("sort", mapListSortParser);

export type MapListFilterSearchParams = inferParserType<typeof mapListFilterParsers>;
export type MapListSortSearchParams = inferParserType<typeof mapListSortParser>;

export const loadMapListSearchParams = createLoader({ ...mapListFilterParsers, sort: mapListSortParser });
const mapListSerialize = createSerializer({ ...mapListFilterParsers, sort: mapListSortParser });

export const useSetSearchParams = () => {
  const [filterParams] = useMapListFilterQueryStates();
  const [sortParams] = useMapListSortQueryState();

  return (updates?: Partial<MapListFilterSearchParams & { sort: MapListSortSearchParams }>) => {
    const currentParams = { ...filterParams, sort: sortParams };
    const mergedParams = { ...currentParams, ...updates };
    const isChanged = JSON.stringify(currentParams) !== JSON.stringify(mergedParams);
    if (!isChanged) return;

    window.history.replaceState(null, "", mapListSerialize(mergedParams) || window.location.pathname);
  };
};
