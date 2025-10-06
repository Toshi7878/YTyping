"use client";

import { useSession } from "next-auth/react";
import { useQueryStates } from "nuqs";
import React from "react";
import { useDifficultyRangeState, useSetDifficultyRange, useSetIsSearching } from "@/app/(home)/_lib/atoms";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { Small } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { mapListSearchParams } from "@/utils/queries/search-params/map-list";

export const MapFilter = () => {
  const { data: session } = useSession();
  const isLogin = !!session?.user?.id;
  return (
    <div className="flex flex-col flex-wrap items-start gap-5 md:flex-row md:items-center">
      {isLogin && <FilterInputs />}
      <SearchRange step={0.1} />
    </div>
  );
};

type FilterMenu<K extends keyof typeof mapListSearchParams> = {
  name: K;
  label: string;
  options: {
    label: string;
    value: NonNullable<ReturnType<(typeof mapListSearchParams)[K]["parse"]>>;
  }[];
};

const USER_FILTER_MENU: FilterMenu<"filter"> = {
  name: "filter",
  label: "フィルター",
  options: [
    { label: "いいね済み", value: "liked" },
    { label: "作成した譜面", value: "my-map" },
  ],
};

export const RANKING_STATUS_FILTER_MENU: FilterMenu<"rankingStatus"> = {
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

const FILTER_CONTENTS = [USER_FILTER_MENU, RANKING_STATUS_FILTER_MENU];
type FilterParam = (typeof FILTER_CONTENTS)[number]["options"][number];

const FilterInputs = () => {
  const [params, setParams] = useQueryStates(mapListSearchParams);
  const setIsSearchingAtom = useSetIsSearching();

  const deriveSortKey = (selectedFilter: typeof params.filter, selectedRankingStatus: typeof params.rankingStatus) => {
    if (selectedFilter === "liked") return "like_desc";
    switch (selectedRankingStatus) {
      case "1st":
      case "not-first":
      case "registerd":
      case "perfect":
        return "ranking-register_desc";
    }

    return null;
  };

  const handleApply = (name: "filter" | "rankingStatus", value: FilterParam["value"], isApply: boolean) => {
    let selectedFilter = params.filter;
    if (name === "filter") {
      selectedFilter = isApply ? (value as typeof params.filter) : null;
    }

    let selectedRankingStatus = params.rankingStatus;
    if (name === "rankingStatus") {
      selectedRankingStatus = isApply ? (value as typeof params.rankingStatus) : null;
    }

    const sort = deriveSortKey(selectedFilter, selectedRankingStatus);
    setIsSearchingAtom(true);
    setParams({ filter: selectedFilter, rankingStatus: selectedRankingStatus, sort }, { history: "replace" });
  };

  return (
    <Card className="min-h-20 py-3 select-none">
      <CardContent className="grid grid-cols-1 gap-1 md:grid-cols-[auto_1fr] items-center">
        {FILTER_CONTENTS.map((filter, filterIndex) => (
          <React.Fragment key={`${filterIndex}-${filter.label}`}>
            <div className="text-foreground flex h-8 min-w-0 items-center text-sm font-medium md:min-w-[80px]">
              {filter.label}
            </div>
            <div className="ml-0 flex flex-wrap items-center gap-1 md:ml-3">
              {filter.options.map((param, index) => {
                const currentValue = filter.name === "filter" ? params.filter : params.rankingStatus;
                const isActived = currentValue === param.value;

                return (
                  <Button
                    key={`${filter.name}-${index}`}
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      handleApply(filter.name, param.value, !isActived);
                    }}
                    className={cn(
                      "transition-none hover:text-secondary-dark rounded px-2 py-1 text-sm hover:underline",
                      isActived && "text-secondary-dark font-bold underline",
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

interface SearchRangeProps {
  step: number;
}

const SearchRange = ({ step }: SearchRangeProps) => {
  const [params, setParams] = useQueryStates(mapListSearchParams);
  const { minRate, maxRate } = useDifficultyRangeState();
  const setDifficultyRange = useSetDifficultyRange();
  const setIsSearching = useSetIsSearching();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const changed = params.minRate !== minRate || params.maxRate !== maxRate;

      if (changed) {
        setIsSearching(true);
        setParams({ minRate, maxRate }, { history: "replace" });
      }
    }
  };

  return (
    <Card className="min-h-23 py-3">
      <CardContent className="mt-1 space-y-1 flex w-56 flex-col items-center gap-2 select-none">
        <Small>難易度</Small>
        <TooltipWrapper label="Enterで検索" sideOffset={24}>
          <DualRangeSlider
            value={[minRate, maxRate]}
            onValueChange={(val) => setDifficultyRange({ minRate: val[0], maxRate: val[1] })}
            min={mapListSearchParams.minRate.defaultValue}
            max={mapListSearchParams.maxRate.defaultValue}
            step={step}
            onKeyDown={handleKeyDown}
          />
        </TooltipWrapper>
        <div className="flex w-full justify-between">
          <span>★{minRate.toFixed(1)}</span>
          <span>★{maxRate.toFixed(1)}</span>
        </div>
      </CardContent>
    </Card>
  );
};
