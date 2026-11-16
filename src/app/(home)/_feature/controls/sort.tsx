import { useTranslations } from "next-intl";
import { type SortIconState, SortToggleButton } from "@/ui/sort-toggle-button";
import type { MAP_SORT_OPTIONS } from "@/validator/map/list";
import { type MapListSortSearchParams, useMapListFilterQueryStates, useMapListSortQueryState } from "./search-params";
import type { RANKING_STATUS_FILTER_MENU } from "./tag-filter";

const RANKING_STATUS_FOR_REGISTER_SORT: (typeof RANKING_STATUS_FILTER_MENU.options)[number]["value"][] = [
  "1st",
  "not-first",
  "registerd",
  "perfect",
];

export const SortControls = () => {
  const t = useTranslations("home.sort");
  const sortOptions: { label: string; value: (typeof MAP_SORT_OPTIONS)[number] }[] = [
    { label: t("publishedAt"), value: "publishedAt" },
    { label: t("difficulty"), value: "difficulty" },
    { label: t("rankingCount"), value: "ranking-count" },
    { label: t("likeCount"), value: "like-count" },
    { label: t("duration"), value: "duration" },
    { label: t("random"), value: "random" },
    { label: t("like"), value: "like" },
    { label: t("rankingRegister"), value: "ranking-register" },
    { label: t("bookmark"), value: "bookmark" },
  ];
  const [params] = useMapListFilterQueryStates();
  const [currentSort, setSortParam] = useMapListSortQueryState();

  return (
    <div className="flex select-none flex-wrap items-center gap-0.5">
      {sortOptions
        .filter(({ value }) => isSortOptionVisible(value, params))
        .map(({ label, value }) => (
          <SortToggleButton
            key={value}
            label={label}
            sortState={deriveSortIconState(value, currentSort)}
            onClick={() => void setSortParam(deriveNextSortParam(value, currentSort))}
          />
        ))}
    </div>
  );
};

const deriveNextSortParam = (
  type: (typeof MAP_SORT_OPTIONS)[number],
  currentSort: MapListSortSearchParams,
): MapListSortSearchParams => {
  if (type === "random") {
    return currentSort.type === "random" ? { type: "publishedAt", isDesc: true } : { type: "random", isDesc: false };
  }
  if (currentSort.type !== type) return { type, isDesc: true };
  if (currentSort.isDesc) return { type, isDesc: false };
  return { type: "publishedAt", isDesc: true };
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
  type: (typeof MAP_SORT_OPTIONS)[number],
  currentSort: MapListSortSearchParams,
): SortIconState => {
  if (type === "random") return currentSort.type === "random" ? "random-active" : "random-inactive";
  if (currentSort.type !== type) return "inactive";
  return currentSort.isDesc ? "desc" : "asc";
};
