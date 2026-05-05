"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import type React from "react";
import { useTRPC } from "@/app/_layout/trpc/provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { cn } from "@/lib/utils";
import type { MAP_RANKING_STATUS_FILTER_OPTIONS, MAP_USER_FILTER_OPTIONS } from "@/validator/map/list";
import {
  type MapListFilterSearchParams,
  type MapListSortSearchParams,
  useMapListFilterQueryStates,
  useMapListSortQueryState,
} from "./search-params";

type FilterMenuConfig<K extends keyof MapListFilterSearchParams> = {
  name: K;
  label: string;
  options: {
    label: string;
    value: MapListFilterSearchParams[K];
  }[];
};

const USER_FILTER_MENU: FilterMenuConfig<"filterType"> = {
  name: "filterType",
  label: "ユーザー",
  options: [
    { label: "いいね済み", value: "liked" },
    { label: "作成した譜面", value: "created" },
    { label: "限定公開", value: "unlisted" },
  ] satisfies { label: string; value: (typeof MAP_USER_FILTER_OPTIONS)[number] }[],
};

export const RANKING_STATUS_FILTER_MENU: FilterMenuConfig<"rankingStatus"> = {
  name: "rankingStatus",
  label: "ランキング",
  options: [
    { label: "1位", value: "1st" },
    { label: "2位以下", value: "not-first" },
    { label: "登録済み", value: "registerd" },
    { label: "未登録", value: "unregisterd" },
    { label: "パーフェクト", value: "perfect" },
  ] satisfies { label: string; value: (typeof MAP_RANKING_STATUS_FILTER_OPTIONS)[number] }[],
};

export const MapListTagFilter = () => {
  return (
    <Card className="flex-1 select-none py-1 sm:max-w-1/2">
      <CardContent className="grid grid-cols-1 items-center sm:grid-cols-[auto_1fr]">
        <FilterMenu key={USER_FILTER_MENU.label} filter={USER_FILTER_MENU}>
          <BookmarkListSelect />
        </FilterMenu>
        <FilterMenu key={RANKING_STATUS_FILTER_MENU.label} filter={RANKING_STATUS_FILTER_MENU} />
        <GenreFilterRow />
      </CardContent>
    </Card>
  );
};

interface FilterMenuProps {
  filter: FilterMenuConfig<"filterType" | "rankingStatus">;
  children?: React.ReactNode;
}

const FilterMenu = ({ filter, children }: FilterMenuProps) => {
  const [params, setFilterParams] = useMapListFilterQueryStates();
  const [, setSortParam] = useMapListSortQueryState();

  return (
    <>
      <div className="flex h-6 min-w-0 items-center font-medium text-[11px] text-muted-foreground md:mr-3 md:min-w-[72px]">
        {filter.label}
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {filter.options.map((param: (typeof filter.options)[number]) => {
          const currentValue = filter.name === "filterType" ? params.filterType : params.rankingStatus;
          const isActive = currentValue === param.value;

          return (
            <Button
              key={param.value}
              variant="ghost"
              onClick={(e) => {
                e.preventDefault();
                const nextParams = getNextFilterParams(filter.name, param.value, !isActive, params);
                void setFilterParams(nextParams);
                void setSortParam(deriveSortParam(nextParams));
              }}
              className={cn(
                "rounded px-1.5 py-0.5 text-[11px] transition-none hover:underline",
                isActive && "bg-accent/40 font-bold text-secondary-light hover:text-secondary-light",
              )}
            >
              {param.label}
            </Button>
          );
        })}
        {children}
      </div>
    </>
  );
};

const BookmarkListSelect = () => {
  const trpc = useTRPC();
  const { data: lists } = useSuspenseQuery(trpc.map.bookmark.lists.getForSession.queryOptions());
  const [params, setFilterParams] = useMapListFilterQueryStates();
  const [, setSortParam] = useMapListSortQueryState();

  const CLEAR_VALUE = "__clear__";
  const value = !params.bookmarkListId ? "" : String(params.bookmarkListId);

  return (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue === CLEAR_VALUE) {
          void setFilterParams({ ...params, bookmarkListId: null });
          void setSortParam(null);
          return;
        }
        void setFilterParams({ ...params, bookmarkListId: Number(nextValue) });
        void setSortParam({ type: "bookmark", isDesc: true });
      }}
    >
      <SelectTrigger
        size="sm"
        className={cn(
          "w-36 font-normal text-[11px]",
          value && "font-bold text-secondary-light hover:text-secondary-light",
        )}
      >
        <SelectValue placeholder="ブックマーク" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={CLEAR_VALUE}>指定なし</SelectItem>
        {lists?.map((list) => (
          <SelectItem key={list.id} value={list.id.toString()}>
            {list.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const GENRE_FILTERS = [
  {
    label: "English",
    params: { maxKanaChunkCount: 0, minAlphabetChunkCount: 1 },
  },
] as const;

const GenreFilterRow = () => {
  const [params, setFilterParams] = useMapListFilterQueryStates();

  return (
    <>
      <div className="flex h-6 min-w-0 items-center font-medium text-[11px] text-muted-foreground md:mr-3 md:min-w-[72px]">
        ジャンル
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {GENRE_FILTERS.map((filter) => {
          const isActive =
            params.maxKanaChunkCount === filter.params.maxKanaChunkCount &&
            params.minAlphabetChunkCount === filter.params.minAlphabetChunkCount;

          return (
            <Button
              key={filter.label}
              variant="ghost"
              onClick={(e) => {
                e.preventDefault();
                void setFilterParams(
                  isActive ? { maxKanaChunkCount: null, minAlphabetChunkCount: null } : { ...filter.params },
                );
              }}
              className={cn(
                "rounded px-1.5 py-0.5 text-[11px] transition-none hover:underline",
                isActive && "bg-accent/40 font-bold text-secondary-light hover:text-secondary-light",
              )}
            >
              {filter.label}
            </Button>
          );
        })}
      </div>
    </>
  );
};

const RANKING_REGISTERED_FILTER_OPTIONS: (typeof MAP_RANKING_STATUS_FILTER_OPTIONS)[number][] = [
  "1st",
  "not-first",
  "registerd",
  "perfect",
];

const deriveSortParam = ({
  filterType,
  rankingStatus,
}: Pick<MapListFilterSearchParams, "filterType" | "rankingStatus">): MapListSortSearchParams => {
  if (filterType === "liked") return { type: "like", isDesc: true };
  if (rankingStatus && RANKING_REGISTERED_FILTER_OPTIONS.includes(rankingStatus)) {
    return { type: "ranking-register", isDesc: true };
  }
  return { type: "publishedAt", isDesc: true };
};

const getNextFilterParams = (
  name: "filterType" | "rankingStatus",
  value:
    | (typeof USER_FILTER_MENU.options)[number]["value"]
    | (typeof RANKING_STATUS_FILTER_MENU.options)[number]["value"],
  isApply: boolean,
  params: MapListFilterSearchParams,
): Pick<MapListFilterSearchParams, "filterType" | "rankingStatus"> => {
  let selectedFilter = params.filterType;
  if (name === "filterType") {
    selectedFilter = isApply ? (value as typeof params.filterType) : null;
  }
  let selectedRankingStatus = params.rankingStatus;
  if (name === "rankingStatus") {
    selectedRankingStatus = isApply ? (value as typeof params.rankingStatus) : null;
  }
  return { filterType: selectedFilter, rankingStatus: selectedRankingStatus };
};
