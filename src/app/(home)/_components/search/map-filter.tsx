"use client";

import { useDifficultyRangeState, useSetDifficultyRange, useSetIsSearching } from "@/app/(home)/_lib/atoms";
import { DIFFICULTY_RANGE } from "@/app/(home)/_lib/const";
import { useDifficultyRangeParams } from "@/app/(home)/_lib/use-difficulty-range-params";
import { Card, CardContent } from "@/components/ui/card";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";
import { cn } from "@/lib/utils";
import { PARAM_NAME } from "@/utils/queries/search-params/map-list";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useState } from "react";

const MapFilter = () => {
  const { data: session } = useSession();
  const isLogin = !!session?.user?.id;
  return (
    <div className="flex flex-col flex-wrap items-start gap-5 md:flex-row md:items-center">
      {isLogin && <FilterInputs />}
      <SearchRange step={0.1} />
    </div>
  );
};

export default MapFilter;

const USER_FILTER_MENU = {
  name: PARAM_NAME.filter,
  label: "フィルター",
  params: [
    { label: "いいね済", value: "liked" as const },
    { label: "作成した譜面", value: "my-map" as const },
  ],
};

const PLAY_STATUS_FILTER_MENU = {
  name: PARAM_NAME.played,
  label: "ランキング",
  params: [
    { label: "1位", value: "1st" as const },
    { label: "2位以下", value: "not-first" as const },
    { label: "登録済", value: "played" as const },
    { label: "未登録", value: "unplayed" as const },
    { label: "パーフェクト", value: "perfect" as const },
  ],
};

const FILTER_CONTENTS = [USER_FILTER_MENU, PLAY_STATUS_FILTER_MENU];
type FilterParam = (typeof FILTER_CONTENTS)[number]["params"][number];

const FilterInputs = () => {
  const searchParams = useSearchParams();
  const setIsSearchingAtom = useSetIsSearching();
  const setDifficultyRangeParams = useDifficultyRangeParams();
  const difficultyRange = useDifficultyRangeState();

  const createQueryString = useCallback(
    (name: string, value: string, isSelected: boolean) => {
      const params = new URLSearchParams(searchParams.toString());

      if (!isSelected) {
        params.set(name, value);
        if (name === USER_FILTER_MENU.name && value === "liked") {
          params.set("sort", "like");
        } else if (name === USER_FILTER_MENU.name) {
          params.delete("sort");
        }
      } else {
        params.delete(name);
        if (name === USER_FILTER_MENU.name && value === "liked") {
          params.delete("sort");
        }
      }

      return setDifficultyRangeParams(params, difficultyRange).toString();
    },
    [searchParams, difficultyRange, setDifficultyRangeParams],
  );

  const currentParams = FILTER_CONTENTS.map((filterParam) => {
    return {
      name: filterParam.name,
      value: searchParams.get(filterParam.name) || "",
    };
  });

  return (
    <Card className="min-h-20 py-3 select-none">
      <CardContent>
        <div className="grid grid-cols-1 gap-1 md:grid-cols-[auto_1fr]">
          {FILTER_CONTENTS.map((filter, filterIndex) => (
            <React.Fragment key={`filter-${filterIndex}`}>
              <p className="text-foreground flex h-8 min-w-0 items-center text-sm font-medium md:min-w-[80px]">
                {filter.label}
              </p>
              <div className="ml-0 flex flex-wrap items-center gap-1 md:ml-3">
                {filter.params.map((param: FilterParam, paramIndex: number) => {
                  const isSelected = currentParams.find((p) => p.name === filter.name)?.value === param.value;

                  return (
                    <Link
                      key={`${filter.name}-${paramIndex}`}
                      href={`?${createQueryString(filter.name, param.value, isSelected)}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsSearchingAtom(true);
                        window.history.replaceState(
                          null,
                          "",
                          `?${createQueryString(filter.name, param.value, isSelected)}`,
                        );
                      }}
                      className={cn(
                        "hover:text-secondary-dark rounded px-2 py-1 text-sm transition-colors hover:underline",
                        isSelected && "text-secondary-dark font-bold underline",
                      )}
                    >
                      {param.label}
                    </Link>
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
  const searchParams = useSearchParams();
  const { min, max } = DIFFICULTY_RANGE;
  const [difficultyRange, setDifficultyRange] = useState<{ min: number; max: number }>({
    min: Number(searchParams.get(PARAM_NAME.minRate)) || min,
    max: Number(searchParams.get(PARAM_NAME.maxRate)) || max,
  });

  const setDifficultyRangeParams = useDifficultyRangeParams();
  const setDifficultyRangeAtom = useSetDifficultyRange();
  const setIsSearchingAtom = useSetIsSearching();

  const handleChange = (val: [number, number]) => {
    setDifficultyRange({ min: val[0], max: val[1] });
    setDifficultyRangeAtom({ min: val[0], max: val[1] });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const params = new URLSearchParams(searchParams.toString());

      const newParams = setDifficultyRangeParams(params, difficultyRange);
      if (newParams.toString() !== searchParams.toString()) {
        setIsSearchingAtom(true);
        window.history.replaceState(null, "", `?${newParams.toString()}`);
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
            <span>★{difficultyRange.min.toFixed(1)}</span>
            <span>★{difficultyRange.max === max ? "∞" : difficultyRange.max.toFixed(1)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
