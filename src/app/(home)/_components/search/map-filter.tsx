"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import type React from "react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { Small } from "@/components/ui/typography";
import {
  type MapListFilterSearchParams,
  type MapListSortSearchParams,
  useMapListFilterQueryStates,
} from "@/lib/search-params/map-list";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/provider";
import { useDebounce } from "@/utils/hooks/use-debounce";
import {
  MAP_DIFFICULTY_RATE_FILTER_LIMIT,
  type MAP_RANKING_STATUS_FILTER_OPTIONS,
  type MAP_USER_FILTER_OPTIONS,
} from "@/validator/map-list";
import { useSetSearchParams } from "../../_lib/use-set-search-params";

export const MapFilter = () => {
  const { data: session } = useSession();
  const isLogin = !!session?.user?.id;
  return (
    <div className="flex flex-col flex-wrap items-start gap-5 md:flex-row md:items-center">
      {isLogin && <FilterControlCard />}
      <DifficultyRangeControl />
    </div>
  );
};

type FilterMenuConfig<K extends keyof MapListFilterSearchParams> = {
  name: K;
  label: string;
  options: {
    label: string;
    value: MapListFilterSearchParams[K];
  }[];
};

const USER_FILTER_MENU: FilterMenuConfig<"filter"> = {
  name: "filter",
  label: "フィルター",
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

const FilterControlCard = () => {
  return (
    <Card className="min-h-20 select-none py-3">
      <CardContent className="grid grid-cols-1 items-center gap-1 md:grid-cols-[auto_1fr]">
        <FilterMenu key={USER_FILTER_MENU.label} filter={USER_FILTER_MENU}>
          <BookmarkListSelect />
        </FilterMenu>
        <FilterMenu key={RANKING_STATUS_FILTER_MENU.label} filter={RANKING_STATUS_FILTER_MENU} />
      </CardContent>
    </Card>
  );
};

interface FilterMenuProps {
  filter: FilterMenuConfig<"filter" | "rankingStatus">;
  children?: React.ReactNode;
}

const FilterMenu = ({ filter, children }: FilterMenuProps) => {
  const [params] = useMapListFilterQueryStates();

  const setSearchParams = useSetSearchParams();
  return (
    <>
      <div className="mr-0 flex h-8 min-w-0 items-center font-medium text-foreground text-sm md:mr-3 md:min-w-[80px]">
        {filter.label}
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {filter.options.map((param: (typeof filter.options)[number], index: number) => {
          const currentValue = filter.name === "filter" ? params.filter : params.rankingStatus;
          const isActive = currentValue === param.value;

          return (
            <Button
              key={`${filter.name}-${index}`}
              variant="ghost"
              onClick={(e) => {
                e.preventDefault();
                const nextParams = getNextFilterParams(filter.name, param.value, !isActive, params);
                const sort = deriveSortParam(nextParams, filter.name, isActive);
                setSearchParams({ ...nextParams, sort });
              }}
              className={cn(
                "rounded px-2 py-1 text-sm transition-none hover:underline",
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
  const { data: lists } = useSuspenseQuery(trpc.map.bookmark.list.getForSession.queryOptions());
  const [params] = useMapListFilterQueryStates();
  const setSearchParams = useSetSearchParams();

  const CLEAR_VALUE = "__clear__";
  const value = !params.bookmarkListId ? "" : String(params.bookmarkListId);

  return (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue === CLEAR_VALUE) {
          setSearchParams({ ...params, bookmarkListId: null, sort: undefined });
          return;
        }
        setSearchParams({ ...params, bookmarkListId: Number(nextValue), sort: { value: "bookmark", desc: true } });
      }}
    >
      <SelectTrigger
        size="sm"
        className={cn("w-40 font-normal", value && "font-bold text-secondary-light hover:text-secondary-light")}
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

const deriveSortParam = (
  {
    filter,
    rankingStatus,
  }: {
    filter: MapListFilterSearchParams["filter"];
    rankingStatus: MapListFilterSearchParams["rankingStatus"];
  },
  name: "filter" | "rankingStatus",
  isActive: boolean,
): MapListSortSearchParams | undefined => {
  const RANKING_REGISTERED_FILTER_OPTIONS: (typeof MAP_RANKING_STATUS_FILTER_OPTIONS)[number][] = [
    "1st",
    "not-first",
    "registerd",
    "perfect",
  ];
  const hasRankingStatusFilter = rankingStatus !== null && RANKING_REGISTERED_FILTER_OPTIONS.includes(rankingStatus);

  if (isActive) {
    if (name === "filter" && hasRankingStatusFilter) {
      return { value: "ranking-register", desc: true };
    }
    if (name === "rankingStatus" && filter === "liked") {
      return { value: "like", desc: true };
    }
    return { value: "publishedAt", desc: true };
  }

  if (name === "filter" && filter === "liked") {
    return { value: "like", desc: true };
  }

  if (name === "rankingStatus" && hasRankingStatusFilter) {
    return { value: "ranking-register", desc: true };
  }

  return { value: "publishedAt", desc: true };
};

const getNextFilterParams = (
  name: "filter" | "rankingStatus",
  value:
    | (typeof USER_FILTER_MENU.options)[number]["value"]
    | (typeof RANKING_STATUS_FILTER_MENU.options)[number]["value"],
  isApply: boolean,
  params: MapListFilterSearchParams,
): Pick<MapListFilterSearchParams, "filter" | "rankingStatus"> => {
  let selectedFilter = params.filter;
  if (name === "filter") {
    selectedFilter = isApply ? (value as typeof params.filter) : null;
  }

  let selectedRankingStatus = params.rankingStatus;
  if (name === "rankingStatus") {
    selectedRankingStatus = isApply ? (value as typeof params.rankingStatus) : null;
  }
  return { filter: selectedFilter, rankingStatus: selectedRankingStatus };
};

const DifficultyRangeControl = () => {
  const [params] = useMapListFilterQueryStates();
  const [pendingMinRate, setPendingMinRate] = useState(params.minRate ?? MAP_DIFFICULTY_RATE_FILTER_LIMIT.min);
  const [pendingMaxRate, setPendingMaxRate] = useState(params.maxRate ?? MAP_DIFFICULTY_RATE_FILTER_LIMIT.max);

  const setSearchParams = useSetSearchParams();
  const { debounce } = useDebounce(500);

  useEffect(() => {
    setPendingMinRate(params.minRate ?? MAP_DIFFICULTY_RATE_FILTER_LIMIT.min);
    setPendingMaxRate(params.maxRate ?? MAP_DIFFICULTY_RATE_FILTER_LIMIT.max);
  }, [params.minRate, params.maxRate]);

  return (
    <Card className="min-h-23 py-3">
      <CardContent className="mt-1 flex w-56 select-none flex-col items-center gap-2 space-y-1">
        <Small>難易度</Small>

        <DualRangeSlider
          value={[pendingMinRate, pendingMaxRate]}
          onValueChange={([minRate, maxRate]) => {
            setPendingMinRate(minRate ?? MAP_DIFFICULTY_RATE_FILTER_LIMIT.min);
            setPendingMaxRate(maxRate ?? MAP_DIFFICULTY_RATE_FILTER_LIMIT.max);
            // biome-ignore lint/style/noNonNullAssertion: <minRateとmaxRateは必ずundefinedではない>
            debounce(() => void setSearchParams({ minRate: minRate!, maxRate: maxRate! }));
          }}
          min={MAP_DIFFICULTY_RATE_FILTER_LIMIT.min}
          max={MAP_DIFFICULTY_RATE_FILTER_LIMIT.max}
          step={0.1}
        />

        <div className="flex w-full justify-between">
          <span>★{pendingMinRate.toFixed(1)}</span>
          <span>★{pendingMaxRate === MAP_DIFFICULTY_RATE_FILTER_LIMIT.max ? "∞" : pendingMaxRate.toFixed(1)}</span>
        </div>
      </CardContent>
    </Card>
  );
};
