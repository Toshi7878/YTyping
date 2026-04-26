import { useAtomValue } from "jotai";
import { atom } from "jotai/vanilla";
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
import { store } from "../provider";

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
    if (value === null || value === Infinity) return null;

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
  bookmarkListId: parseAsInteger,
};
const mapListSortParser = parseAsSort.withDefault({ value: "publishedAt", desc: true });

export const useMapListFilterQueryStates = () => useQueryStates(mapListFilterParsers);
export const useMapListSortQueryState = () => useQueryState("sort", mapListSortParser);

export type MapListFilterSearchParams = inferParserType<typeof mapListFilterParsers>;
export type MapListSortSearchParams = inferParserType<typeof mapListSortParser>;

export const loadMapListSearchParams = createLoader({ ...mapListFilterParsers, sort: mapListSortParser });
export const mapListSerialize = createSerializer({ ...mapListFilterParsers, sort: mapListSortParser });

const isSearchingAtom = atom(false);
export const useIsSearchingState = () => useAtomValue(isSearchingAtom);
export const setIsSearching = (value: boolean) => store.set(isSearchingAtom, value);

export const useSetSearchParams = () => {
  const [params] = useMapListFilterQueryStates();

  return (updates?: Partial<MapListFilterSearchParams & { sort: MapListSortSearchParams }>) => {
    const mergedParams = { ...params, ...updates };
    const isChanged = JSON.stringify(params) !== JSON.stringify(mergedParams);
    if (!isChanged) return;

    setIsSearching(true);
    window.history.replaceState(null, "", mapListSerialize(mergedParams) || window.location.pathname);
  };
};
