"use client";

import type { VariantProps } from "class-variance-authority";
import { useEffect, useState } from "react";
import { DIFFICULTY_TIERS } from "@/domain/map/rating/badge";
import { cn } from "@/lib/tailwind";
import { Button, type buttonVariants } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { DualRangeSlider } from "@/ui/dual-range-slider";
import { useDebounce } from "@/utils/hooks/use-debounce";
import { useMapListFilterQueryStates } from "./search-params";

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
const RANGE = { min: 0, max: 16 };

export const DifficultyFilter = ({ className }: { className?: string }) => {
  const [params, setFilterParams] = useMapListFilterQueryStates();

  const handleTierClick = (tier: (typeof DIFFICULTY_TIERS)[number]) => {
    const isTierExact = params.minRate === tier.min && params.maxRate === tier.max;
    if (isTierExact) {
      void setFilterParams({ minRate: null, maxRate: null });
    } else {
      void setFilterParams({ minRate: tier.min, maxRate: tier.max });
    }
  };

  return (
    <Card className={cn("flex-1 justify-end py-3", className)}>
      <CardContent className="flex w-full select-none flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {DIFFICULTY_TIERS.map((tier) => {
            const hasFilter = params.minRate > RANGE.min || params.maxRate !== null;
            const currentMax = params.maxRate ?? RANGE.max;
            const isSelected = hasFilter && params.minRate <= (tier.max ?? Infinity) && currentMax >= tier.min;
            const variant: ButtonVariant = tier.variant;
            return (
              <Button
                key={tier.label}
                variant={variant}
                size="xs"
                onClick={() => handleTierClick(tier)}
                className={cn("gap-1.5 font-bold", isSelected ? "border-2" : "border-2 border-transparent")}
              >
                {tier.label}
              </Button>
            );
          })}
        </div>
        <DifficultyDualSlider
          minRate={params.minRate ?? RANGE.min}
          maxRate={params.maxRate ?? RANGE.max}
          onChange={(minRate, maxRate) => void setFilterParams({ minRate: minRate ?? 0, maxRate: maxRate ?? null })}
          className="w-full"
        />
      </CardContent>
    </Card>
  );
};

const DifficultyDualSlider = ({
  minRate,
  maxRate,
  onChange,
  className,
}: {
  minRate: number;
  maxRate: number;
  onChange: (minRate: number | undefined, maxRate: number | undefined) => void;
  className?: string;
}) => {
  const { debounce } = useDebounce(500);

  const [pendingMinRate, setPendingMinRate] = useState(minRate ?? RANGE.min);
  const [pendingMaxRate, setPendingMaxRate] = useState(maxRate ?? RANGE.max);

  useEffect(() => {
    setPendingMinRate(minRate ?? RANGE.min);
    setPendingMaxRate(maxRate ?? RANGE.max);
  }, [minRate, maxRate]);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <DualRangeSlider
        value={[pendingMinRate, pendingMaxRate]}
        onValueChange={([minRate, maxRate]) => {
          setPendingMinRate(minRate ?? 0);
          setPendingMaxRate(maxRate != null && maxRate < RANGE.max ? maxRate : RANGE.max);
          debounce(
            // biome-ignore lint/style/noNonNullAssertion: minRate と maxRate は必ず非 undefined
            () => void onChange(minRate!, maxRate != null ? maxRate : undefined),
          );
        }}
        min={RANGE.min}
        max={RANGE.max}
        step={0.1}
      />
      <div className="flex w-full justify-between text-xs">
        <span>★{pendingMinRate.toFixed(1)}</span>
        <span>★{pendingMaxRate < RANGE.max ? pendingMaxRate.toFixed(1) : "∞"}</span>
      </div>
    </div>
  );
};
