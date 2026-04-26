import { type SortIconState, SortToggleButton } from "@/components/ui/sort-toggle-button";
import type { MAP_SORT_OPTIONS } from "@/validator/map/list";
import {
  type MapListSortSearchParams,
  useMapListFilterQueryStates,
  useMapListSortQueryState,
  useSetSearchParams,
} from "./search-params";
import type { RANKING_STATUS_FILTER_MENU } from "./tag-filter";

const SORT_OPTIONS: { label: string; value: (typeof MAP_SORT_OPTIONS)[number] }[] = [
  { label: "公開日", value: "publishedAt" },
  { label: "難易度", value: "difficulty" },
  { label: "ランキング数", value: "ranking-count" },
  { label: "いいね数", value: "like-count" },
  { label: "曲の長さ", value: "duration" },
  { label: "ランダム", value: "random" },
  { label: "いいね", value: "like" },
  { label: "記録登録日", value: "ranking-register" },
  { label: "ブックマーク", value: "bookmark" },
];

const RANKING_STATUS_FOR_REGISTER_SORT: (typeof RANKING_STATUS_FILTER_MENU.options)[number]["value"][] = [
  "1st",
  "not-first",
  "registerd",
  "perfect",
];

export const SortControls = () => {
  const setSearchParams = useSetSearchParams();
  const [params] = useMapListFilterQueryStates();
  const [currentSort] = useMapListSortQueryState();

  return (
    <div className="flex select-none flex-wrap items-center gap-1">
      {SORT_OPTIONS.filter(({ value }) => isSortOptionVisible(value, params)).map(({ label, value }) => (
        <SortToggleButton
          key={value}
          label={label}
          sortState={deriveSortIconState(value, currentSort)}
          onClick={() => setSearchParams({ sort: deriveNextSortParam(value, currentSort) })}
        />
      ))}
    </div>
  );
};

const deriveNextSortParam = (
  value: (typeof MAP_SORT_OPTIONS)[number],
  currentSort: MapListSortSearchParams,
): MapListSortSearchParams => {
  if (value === "random") {
    return currentSort.value === "random" ? { value: "publishedAt", desc: true } : { value: "random", desc: false };
  }
  if (currentSort.value !== value) return { value, desc: true };
  if (currentSort.desc) return { value, desc: false };
  return { value: "publishedAt", desc: true };
};

const isSortOptionVisible = (
  value: (typeof MAP_SORT_OPTIONS)[number],
  params: ReturnType<typeof useMapListFilterQueryStates>[0],
): boolean => {
  if (value === "like") return params.filterType === "liked";
  if (value === "ranking-register") {
    return params.rankingStatus !== null && RANKING_STATUS_FOR_REGISTER_SORT.includes(params.rankingStatus);
  }
  if (value === "bookmark") return params.bookmarkListId !== null;
  return true;
};

const deriveSortIconState = (
  value: (typeof MAP_SORT_OPTIONS)[number],
  currentSort: MapListSortSearchParams,
): SortIconState => {
  if (value === "random") return currentSort.value === "random" ? "random-active" : "random-inactive";
  if (currentSort.value !== value) return "inactive";
  return currentSort.desc ? "desc" : "asc";
};
