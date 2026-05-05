"use client";
import type { ComponentProps } from "react";
import { useEffect, useState } from "react";
import { Button } from "@/ui/button";
import { DualRangeSlider } from "@/ui/dual-range-slider";
import { Label } from "@/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { RadioCard, RadioGroup } from "@/ui/radio-group/radio-group";
import { useDebounce } from "@/utils/hooks/use-debounce";
import { CLEAR_RATE_LIMIT, KPM_LIMIT, PLAY_SPEED_LIMIT, type RESULT_INPUT_METHOD_TYPES } from "@/validator/result/list";
import { useResultListFilterQueryStates } from "../search-params";

export const FilterFieldsPopover = () => {
  const [filterParams, setFilterParams] = useResultListFilterQueryStates();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">詳細フィルター</Button>
      </PopoverTrigger>
      <PopoverContent className="w-screen sm:w-fit" align="start">
        <SearchModeRadioCardGroup mode={filterParams.mode} onModeChange={(mode) => void setFilterParams({ mode })} />
        <SearchRange
          label="kpm"
          min={KPM_LIMIT.min}
          max={KPM_LIMIT.max}
          step={10}
          isMaxLabel
          value={[filterParams.minKpm, filterParams.maxKpm]}
          onRangeChange={(min, max) => void setFilterParams({ minKpm: min, maxKpm: max })}
        />
        <SearchRange
          label="% (クリア率)"
          min={CLEAR_RATE_LIMIT.min}
          max={CLEAR_RATE_LIMIT.max}
          step={1}
          value={[filterParams.minClearRate, filterParams.maxClearRate]}
          onRangeChange={(min, max) => void setFilterParams({ minClearRate: min, maxClearRate: max })}
        />
        <SearchRange
          label="倍速"
          min={PLAY_SPEED_LIMIT.min}
          max={PLAY_SPEED_LIMIT.max}
          step={0.25}
          value={[filterParams.minPlaySpeed, filterParams.maxPlaySpeed]}
          onRangeChange={(min, max) => void setFilterParams({ minPlaySpeed: min, maxPlaySpeed: max })}
        />
      </PopoverContent>
    </Popover>
  );
};

interface SearchModeRadioCardGroupProps {
  mode: (typeof RESULT_INPUT_METHOD_TYPES)[number] | null;
  onModeChange: (mode: (typeof RESULT_INPUT_METHOD_TYPES)[number] | null) => void;
}

const SearchModeRadioCardGroup = ({ mode, onModeChange }: SearchModeRadioCardGroupProps) => {
  const MODE_RADIO_CARDS: { label: string; value: (typeof RESULT_INPUT_METHOD_TYPES)[number] | "all" }[] = [
    { label: "全て", value: "all" },
    { label: "ローマ字", value: "roma" },
    { label: "かな", value: "kana" },
    { label: "ローマ字&かな", value: "romakana" },
    { label: "英語", value: "english" },
  ];

  return (
    <RadioGroup
      value={mode ?? "all"}
      onValueChange={(value: (typeof RESULT_INPUT_METHOD_TYPES)[number] | "all") =>
        onModeChange(value === "all" ? null : value)
      }
      className="flex flex-wrap gap-1"
    >
      {MODE_RADIO_CARDS.map((option) => {
        const isSelected = (mode ?? "all") === option.value;

        return (
          <RadioCard
            key={option.value}
            className="rounded-sm"
            value={option.value}
            variant={option.value}
            size="sm"
            data-state={isSelected ? "checked" : "unchecked"}
          >
            {option.label}
          </RadioCard>
        );
      })}
    </RadioGroup>
  );
};

interface SearchRangeProps {
  label: string;
  value: [number, number];
  onRangeChange: (min: number, max: number) => void;
  isMaxLabel?: boolean;
}

const SearchRange = ({
  label,
  min,
  max,
  step = 1,
  value,
  onRangeChange,
  isMaxLabel = false,
}: SearchRangeProps & Omit<ComponentProps<typeof DualRangeSlider>, "value" | "label" | "onValueChange">) => {
  const { debounce } = useDebounce(500);
  const [pendingMin, setPendingMin] = useState(value[0]);
  const [pendingMax, setPendingMax] = useState(value[1]);

  useEffect(() => {
    setPendingMin(value[0]);
    setPendingMax(value[1]);
  }, [value[0], value[1]]);

  const maxLabel = isMaxLabel && pendingMax === max ? "最大" : pendingMax;

  return (
    <div className="space-y-3 py-4">
      <Label>{`${pendingMin} - ${maxLabel} ${label}`}</Label>
      <DualRangeSlider
        value={[pendingMin, pendingMax]}
        min={min}
        max={max}
        step={step}
        onValueChange={([newMin, newMax]) => {
          setPendingMin(newMin ?? 0);
          setPendingMax(newMax ?? 0);
          debounce(() => void onRangeChange(newMin ?? 0, newMax ?? 0));
        }}
        aria-label={`${label}の範囲を設定`}
      />
    </div>
  );
};
