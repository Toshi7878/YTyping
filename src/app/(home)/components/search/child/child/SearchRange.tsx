"use client";

import { useSetDifficultyRange, useSetIsSearching } from "@/app/(home)/atoms/atoms";
import { useDifficultyRangeParams } from "@/app/(home)/hook/useDifficultyRangeParams";
import { DIFFICULTY_RANGE, PARAM_NAME } from "@/app/(home)/ts/consts";
import { DualRangeSlider } from "@/components/ui/dural-range-slider";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface SearchRangeProps {
  step: number;
}

const SearchRange = ({ step, ...rest }: SearchRangeProps & React.HTMLAttributes<HTMLDivElement>) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { min, max } = DIFFICULTY_RANGE;
  const [difficultyRange, setDifficultyRange] = useState<{ min: number; max: number }>({
    min: Number(searchParams.get(PARAM_NAME.minRate)) || min,
    max: Number(searchParams.get(PARAM_NAME.maxRate)) || max,
  });

  const setDifficultyRangeParams = useDifficultyRangeParams();
  const setDifficultyRangeAtom = useSetDifficultyRange();
  const setIsSearchingAtom = useSetIsSearching();

  const handleChange = (val: number[]) => {
    setDifficultyRange({ min: val[0], max: val[1] });
    setDifficultyRangeAtom({ min: val[0], max: val[1] });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const params = new URLSearchParams(searchParams.toString());

      const newParams = setDifficultyRangeParams(params, difficultyRange);
      if (newParams.toString() !== searchParams.toString()) {
        setIsSearchingAtom(true);
        router.replace(`?${newParams.toString()}`);
      }
    }
  };

  return (
    <div className="bg-card border-border flex min-h-[75px] w-52 rounded-md border p-1">
      <div className="m-auto flex w-48 flex-col items-center gap-2 select-none" onKeyDown={handleKeyDown} {...rest}>
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
    </div>
  );
};

export default SearchRange;
