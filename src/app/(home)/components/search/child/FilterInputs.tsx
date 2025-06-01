"use client";

import { useDifficultyRangeState, useSetIsSearching } from "@/app/(home)/atoms/atoms";
import { useDifficultyRangeParams } from "@/app/(home)/hook/useDifficultyRangeParams";
import { MY_FILTER, PLAYED_FILTER } from "@/app/(home)/ts/consts";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useCallback } from "react";

const FILTER_CONTENT = [MY_FILTER, PLAYED_FILTER];
type FilterParam = (typeof FILTER_CONTENT)[number]["params"][number];

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
        if (name === MY_FILTER.name && value === "liked") {
          params.set("sort", "like");
        } else if (name === MY_FILTER.name) {
          params.delete("sort");
        }
      } else {
        params.delete(name);
        if (name === MY_FILTER.name && value === "liked") {
          params.delete("sort");
        }
      }

      return setDifficultyRangeParams(params, difficultyRange).toString();
    },
    [searchParams, difficultyRange, setDifficultyRangeParams]
  );

  const currentParams = FILTER_CONTENT.map((filterParam) => {
    return {
      name: filterParam.name,
      value: searchParams.get(filterParam.name) || "",
    };
  });

  return (
    <div className="bg-card py-1 px-2 rounded-md border border-border shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-1">
        {FILTER_CONTENT.map((filter, filterIndex) => (
          <React.Fragment key={`filter-${filterIndex}`}>
            <p className="text-sm font-medium flex items-center text-foreground min-w-0 md:min-w-[80px] h-8">
              {filter.label}
            </p>
            <div className="ml-0 md:ml-3 flex gap-1 items-center flex-wrap">
              {filter.params.map((param: FilterParam, paramIndex: number) => {
                const isSelected = currentParams.find((p) => p.name === filter.name)?.value === param.value;

                return (
                  <Link
                    key={`${filter.name}-${paramIndex}`}
                    href={`?${createQueryString(filter.name, param.value, isSelected)}`}
                    onClick={() => setIsSearchingAtom(true)}
                    className={cn(
                      "text-sm px-2 py-1 rounded hover:text-secondary-dark hover:underline transition-colors",
                      isSelected ? "font-bold text-secondary-dark underline" : "font-normal text-secondary-light"
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
    </div>
  );
};

export default FilterInputs;
