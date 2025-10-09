"use client";

import { useSession } from "next-auth/react";
import { useQueryStates } from "nuqs";
import React from "react";
import {
  usePendingDifficultyRangeState,
  useReadPendingDifficultyRange,
  useSetPendingDifficultyRange,
} from "@/app/(home)/_lib/atoms";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { Small } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { type MapListSearchParams, mapListSearchParams } from "@/utils/queries/search-params/map-list";
import { useSetParams } from "../../_lib/use-set-params";

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
    { label: "作成した譜面", value: "my-map" },
  ],
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
  ],
};

const FILTER_MENUS = [USER_FILTER_MENU, RANKING_STATUS_FILTER_MENU];
type FilterParam = (typeof FILTER_MENUS)[number]["options"][number];

const FilterControls = () => {
  const [params] = useQueryStates(mapListSearchParams);
  const readPendingDifficultyRange = useReadPendingDifficultyRange();
  const setParams = useSetParams();

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
        return { id: "ranking-register", desc: true };
      }
      if (name === "rankingStatus" && filter === "liked") {
        return { id: "like", desc: true };
      }
      return { id: "id", desc: true };
    }

    if (name === "filter" && filter === "liked") {
      return { id: "like", desc: true };
    }

    if (name === "rankingStatus" && hasRankingStatusFilter) {
      return { id: "ranking-register", desc: true };
    }

    return { id: "id", desc: true };
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
    <Card className="min-h-20 py-3 select-none">
      <CardContent className="grid grid-cols-1 gap-1 md:grid-cols-[auto_1fr] items-center">
        {FILTER_MENUS.map((filter, filterIndex) => (
          <React.Fragment key={`${filterIndex}-${filter.label}`}>
            <div className="text-foreground flex h-8 min-w-0 items-center text-sm font-medium md:min-w-[80px]">
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
                      setParams({ ...nextParams, sort, ...readPendingDifficultyRange() });
                    }}
                    className={cn(
                      "transition-none  rounded px-2 py-1 text-sm hover:underline",
                      isActive && "text-secondary-light hover:text-secondary-light font-bold  bg-accent/40",
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
  const [params] = useQueryStates(mapListSearchParams);
  const { minRate: pendingMinRate, maxRate: pendingMaxRate } = usePendingDifficultyRangeState();
  const setPendingDifficultyRange = useSetPendingDifficultyRange();
  const setParams = useSetParams();

  const handleEnterKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setParams({ ...params, minRate: pendingMinRate, maxRate: pendingMaxRate });
    }
  };

  return (
    <Card className="min-h-23 py-3">
      <CardContent className="mt-1 space-y-1 flex w-56 flex-col items-center gap-2 select-none">
        <Small>難易度</Small>
        <TooltipWrapper label="Enterで検索" sideOffset={24}>
          <DualRangeSlider
            value={[pendingMinRate, pendingMaxRate]}
            onValueChange={(val) => setPendingDifficultyRange({ minRate: val[0], maxRate: val[1] })}
            min={mapListSearchParams.minRate.defaultValue}
            max={mapListSearchParams.maxRate.defaultValue}
            step={0.1}
            onKeyDown={handleEnterKeyDown}
          />
        </TooltipWrapper>
        <div className="flex w-full justify-between">
          <span>★{pendingMinRate.toFixed(1)}</span>
          <span>★{pendingMaxRate === 12 ? "∞" : pendingMaxRate.toFixed(1)}</span>
        </div>
      </CardContent>
    </Card>
  );
};
