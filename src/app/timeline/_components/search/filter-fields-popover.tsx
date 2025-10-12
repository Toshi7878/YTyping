"use client";
import type { SetStateAction } from "jotai";
import { type ComponentProps, type Dispatch, useCallback, useMemo } from "react";
import {
  useSearchResultClearRateState,
  useSearchResultKpmState,
  useSearchResultModeState,
  useSearchResultSpeedState,
  useSetSearchResultClearRate,
  useSetSearchResultKpm,
  useSetSearchResultMode,
  useSetSearchResultSpeed,
} from "@/app/timeline/_lib/atoms";
import { Button } from "@/components/ui/button";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioCard, RadioGroup } from "@/components/ui/radio-group/radio-group";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { type ResultListSearchParams, resultListSearchParams } from "@/lib/queries/schema/result-list";
import { useSetParams } from "../../_lib/use-set-search-params";

export const FilterFieldsPopover = () => {
  const searchKpm = useSearchResultKpmState();
  const searchClearRate = useSearchResultClearRateState();
  const searchSpeed = useSearchResultSpeedState();
  const setSearchKpm = useSetSearchResultKpm();
  const setSearchClearRate = useSetSearchResultClearRate();
  const setSearchSpeed = useSetSearchResultSpeed();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">詳細フィルター</Button>
      </PopoverTrigger>
      <PopoverContent className="border-border w-xl" align="start">
        <SearchModeRadioCardGroup />
        <SearchRange
          label="kpm"
          min={resultListSearchParams.minKpm.defaultValue}
          max={resultListSearchParams.maxKpm.defaultValue}
          step={10}
          isMaxLabel
          value={searchKpm}
          setValue={setSearchKpm}
        />
        <SearchRange
          label="% (クリア率)"
          min={resultListSearchParams.minClearRate.defaultValue}
          max={resultListSearchParams.maxClearRate.defaultValue}
          step={1}
          value={searchClearRate}
          setValue={setSearchClearRate}
        />
        <SearchRange
          label="倍速"
          min={resultListSearchParams.minPlaySpeed.defaultValue}
          max={resultListSearchParams.maxPlaySpeed.defaultValue}
          step={0.25}
          value={searchSpeed}
          setValue={setSearchSpeed}
        />
      </PopoverContent>
    </Popover>
  );
};

const SearchModeRadioCardGroup = () => {
  const mode = useSearchResultModeState();
  const setMode = useSetSearchResultMode();
  const setParams = useSetParams();

  const MODE_RADIO_CARDS: { label: string; value: ResultListSearchParams["mode"] }[] = [
    { label: "全て", value: "all" },
    { label: "ローマ字", value: "roma" },
    { label: "かな", value: "kana" },
    { label: "ローマ字&かな", value: "romakana" },
    { label: "英語", value: "english" },
  ];

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setParams({ mode });
    }
  };

  return (
    <RadioGroup
      value={mode}
      onValueChange={(value: ResultListSearchParams["mode"]) => setMode(value)}
      className="flex gap-1"
      onKeyDown={onKeyDown}
    >
      {MODE_RADIO_CARDS.map((option) => {
        const isSelected = mode === option.value;

        return (
          <TooltipWrapper key={option.value} label="Enterで検索" disabled={!isSelected}>
            <RadioCard
              className="rounded-sm"
              value={option.value}
              variant={option.value}
              size="sm"
              data-state={isSelected ? "checked" : "unchecked"}
            >
              {option.label}
            </RadioCard>
          </TooltipWrapper>
        );
      })}
    </RadioGroup>
  );
};

interface RangeValue {
  min: number;
  max: number;
}

interface SearchRangeProps {
  label: string;
  value: RangeValue;
  setValue: Dispatch<SetStateAction<RangeValue>>;
  isMaxLabel?: boolean;
}

const SearchRange = ({
  label,
  min,
  max,
  step = 1,
  value,
  setValue,
  disabled = false,
  isMaxLabel = false,
}: SearchRangeProps & Omit<ComponentProps<typeof DualRangeSlider>, "value" | "label">) => {
  const setParams = useSetParams();

  const handleValueChange = useCallback(
    (newValue: number[]) => {
      setValue({ min: newValue[0], max: newValue[1] });
    },
    [setValue],
  );

  const displayValue = useMemo(() => {
    const maxLabel = isMaxLabel && value.max === max ? "最大" : value.max;
    const displayUnit = label;

    return `${value.min} - ${maxLabel} ${displayUnit}`;
  }, [value, label, isMaxLabel, max]);

  return (
    <div className="space-y-3 py-4">
      <Label>{displayValue}</Label>
      <TooltipWrapper label="Enterで検索" disabled={disabled}>
        <DualRangeSlider
          value={[value.min, value.max]}
          min={min}
          max={max}
          step={step}
          onValueChange={handleValueChange}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              setParams();
            }
          }}
          disabled={disabled}
          aria-label={`${label}の範囲を設定`}
        />
      </TooltipWrapper>
    </div>
  );
};
