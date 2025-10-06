"use client";

import { useSession } from "next-auth/react";
import { useQueryStates } from "nuqs";
import React, { useCallback, useState } from "react";
import { useSetDifficultyRange, useSetIsSearching } from "@/app/(home)/_lib/atoms";
import { DIFFICULTY_RANGE } from "@/app/(home)/_lib/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";
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

  const current = FILTER_CONTENTS.map((filter) => ({
    name: filter.name,
    value: params[filter.name],
  }));

  const handleApply = useCallback(
    (name: "filter" | "rankingStatus", value: FilterParam["value"], isApply: boolean) => {
      const isFilterOption = name === "filter";
      const isRankingStatusOption = name === "rankingStatus";

      const rankingRegisteredStatuses: (typeof RANKING_STATUS_FILTER_MENU.options)[number]["value"][] = [
        "1st",
        "not-first",
        "registerd",
        "unregisterd",
        "perfect",
      ];

      const nextFilter = (isFilterOption ? (isApply ? (value as typeof params.filter) : null) : params.filter) ?? null;
      const nextRankingStatus =
        (isRankingStatusOption ? (isApply ? (value as typeof params.rankingStatus) : null) : params.rankingStatus) ??
        null;

      const hasRankingRegisteredStatusFilter = nextRankingStatus
        ? rankingRegisteredStatuses.includes(nextRankingStatus)
        : false;
      const hasLikedFilter = nextFilter === "liked";

      const updates: Partial<
        typeof params & { sort: string | null } & { filter: typeof params.filter | null } & {
          rankingStatus: typeof params.rankingStatus | null;
        }
      > = {};

      if (isFilterOption) updates.filter = isApply ? (value as typeof params.filter) : null;
      if (isRankingStatusOption) updates.rankingStatus = isApply ? (value as typeof params.rankingStatus) : null;

      if (hasLikedFilter) {
        updates.sort = "like_desc";
      } else if (hasRankingRegisteredStatusFilter) {
        updates.sort = "ranking-register_desc";
      } else {
        updates.sort = null;
      }

      setIsSearchingAtom(true);
      setParams(updates, { history: "replace" });
    },
    [params, setParams, setIsSearchingAtom],
  );

  return (
    <Card className="min-h-20 py-3 select-none">
      <CardContent>
        <div className="grid grid-cols-1 gap-1 md:grid-cols-[auto_1fr] items-center">
          {FILTER_CONTENTS.map((filter, filterIndex) => (
            <React.Fragment key={`${filterIndex}-${filter.label}`}>
              <div className="text-foreground flex h-8 min-w-0 items-center text-sm font-medium md:min-w-[80px]">
                {filter.label}
              </div>
              <div className="ml-0 flex flex-wrap items-center gap-1 md:ml-3">
                {filter.options.map((param: FilterParam, index: number) => {
                  const isActived = current.find((p) => p.name === filter.name)?.value === param.value;

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
        </div>
      </CardContent>
    </Card>
  );
};

interface SearchRangeProps {
  step: number;
}

const SearchRange = ({ step, ...rest }: SearchRangeProps & React.HTMLAttributes<HTMLDivElement>) => {
  const [params, setParams] = useQueryStates(mapListSearchParams);
  const { min, max } = DIFFICULTY_RANGE;
  const [difficultyRange, setDifficultyRange] = useState<{ min: number; max: number }>({
    min: (typeof params.minRate === "number" && params.minRate) || min,
    max: (typeof params.maxRate === "number" && params.maxRate) || max,
  });

  const setDifficultyRangeAtom = useSetDifficultyRange();
  const setIsSearchingAtom = useSetIsSearching();

  const handleChange = (val: [number, number]) => {
    setDifficultyRange({ min: val[0], max: val[1] });
    setDifficultyRangeAtom({ min: val[0], max: val[1] });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const next: Partial<typeof params> = {};
      next.minRate = difficultyRange.min !== min ? difficultyRange.min : (null as unknown as number);
      next.maxRate = difficultyRange.max !== max ? difficultyRange.max : (null as unknown as number);

      const changed =
        (params.minRate ?? min) !== difficultyRange.min || (params.maxRate ?? max) !== difficultyRange.max;
      if (changed) {
        setIsSearchingAtom(true);
        setParams(next, { history: "replace" });
      }
    }
  };

  return (
    <Card className="min-h-23">
      <CardContent>
        <div className="mt-1 flex w-48 flex-col items-center gap-2 select-none" onKeyDown={handleKeyDown} {...rest}>
          <DualRangeSlider
            value={[difficultyRange.min, difficultyRange.max]}
            onValueChange={handleChange}
            min={min}
            max={max}
            step={step}
          />
          <div className="flex w-full justify-between">
            <span>{difficultyRange.min.toFixed(1)}</span>
            <span>{difficultyRange.max.toFixed(1)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
