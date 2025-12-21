"use client";

import { useSession } from "next-auth/react";
import { useQueryStates } from "nuqs";
import React from "react";
import { usePendingDifficultyRangeState, useSetPendingDifficultyRange } from "@/app/(home)/_lib/atoms";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { Small } from "@/components/ui/typography";
import { type MapListSearchParams, mapListSearchParams } from "@/lib/search-params/map-list";
import { cn } from "@/lib/utils";
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
      {isLogin && <FilterControls />}
      <DifficultyRangeControl />
    </div>
  );
};

type FilterMenuConfig<K extends keyof MapListSearchParams> = {
  name: K;
  label: string;
  options: {
    label: string;
    value: MapListSearchParams[K];
  }[];
};

const USER_FILTER_MENU: FilterMenuConfig<"filter"> = {
  name: "filter",
  label: "フィルター",
  options: [
    { label: "いいね済み", value: "liked" },
    { label: "作成した譜面", value: "created" },
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

const FILTER_MENUS = [USER_FILTER_MENU, RANKING_STATUS_FILTER_MENU];
type FilterParam = (typeof FILTER_MENUS)[number]["options"][number];

const FilterControls = () => {
  const [params] = useQueryStates(mapListSearchParams);
  const setSearchParams = useSetSearchParams();

  const deriveSortParam = (
    {
      filter,
      rankingStatus,
    }: {
      filter: typeof params.filter;
      rankingStatus: typeof params.rankingStatus;
    },
    name: "filter" | "rankingStatus",
    isActive: boolean,
  ): MapListSearchParams["sort"] | undefined => {
    const hasRankingStatusFilter =
      rankingStatus === "1st" ||
      rankingStatus === "not-first" ||
      rankingStatus === "registerd" ||
      rankingStatus === "perfect";

    if (isActive) {
      if (name === "filter" && hasRankingStatusFilter) {
        return { value: "ranking-register", desc: true };
      }
      if (name === "rankingStatus" && filter === "liked") {
        return { value: "like", desc: true };
      }
      return { value: "id", desc: true };
    }

    if (name === "filter" && filter === "liked") {
      return { value: "like", desc: true };
    }

    if (name === "rankingStatus" && hasRankingStatusFilter) {
      return { value: "ranking-register", desc: true };
    }

    return { value: "id", desc: true };
  };

  const getNextFilterParams = (
    name: "filter" | "rankingStatus",
    value: FilterParam["value"],
    isApply: boolean,
  ): Pick<MapListSearchParams, "filter" | "rankingStatus"> => {
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

  return (
    <Card className="min-h-20 select-none py-3">
      <CardContent className="grid grid-cols-1 items-center gap-1 md:grid-cols-[auto_1fr]">
        {FILTER_MENUS.map((filter, filterIndex) => (
          <React.Fragment key={`${filterIndex}-${filter.label}`}>
            <div className="flex h-8 min-w-0 items-center font-medium text-foreground text-sm md:min-w-[80px]">
              {filter.label}
            </div>
            <div className="ml-0 flex flex-wrap items-center gap-1 md:ml-3">
              {filter.options.map((param: (typeof filter.options)[number], index: number) => {
                const currentValue = filter.name === "filter" ? params.filter : params.rankingStatus;
                const isActive = currentValue === param.value;

                return (
                  <Button
                    key={`${filter.name}-${index}`}
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      const nextParams = getNextFilterParams(filter.name, param.value, !isActive);
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
            </div>
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  );
};

const DifficultyRangeControl = () => {
  const { minRate: pendingMinRate, maxRate: pendingMaxRate } = usePendingDifficultyRangeState();
  const setPendingDifficultyRange = useSetPendingDifficultyRange();
  const setSearchParams = useSetSearchParams();

  const handleEnterKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setSearchParams({ minRate: pendingMinRate, maxRate: pendingMaxRate });
    }
  };

  return (
    <Card className="min-h-23 py-3">
      <CardContent className="mt-1 flex w-56 select-none flex-col items-center gap-2 space-y-1">
        <Small>難易度</Small>
        <TooltipWrapper label="Enterで検索" sideOffset={24}>
          <DualRangeSlider
            value={[pendingMinRate, pendingMaxRate]}
            onValueChange={([minRate, maxRate]) => {
              // biome-ignore lint/style/noNonNullAssertion: <minRateとmaxRateは必ずundefinedではない>
              setPendingDifficultyRange({ minRate: minRate!, maxRate: maxRate! });
            }}
            min={MAP_DIFFICULTY_RATE_FILTER_LIMIT.min}
            max={MAP_DIFFICULTY_RATE_FILTER_LIMIT.max}
            step={0.1}
            onKeyDown={handleEnterKeyDown}
          />
        </TooltipWrapper>
        <div className="flex w-full justify-between">
          <span>★{pendingMinRate.toFixed(1)}</span>
          <span>★{pendingMaxRate === MAP_DIFFICULTY_RATE_FILTER_LIMIT.max ? "∞" : pendingMaxRate.toFixed(1)}</span>
        </div>
      </CardContent>
    </Card>
  );
};
