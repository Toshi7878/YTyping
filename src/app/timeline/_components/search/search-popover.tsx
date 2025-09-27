"use client";
import { useCallback, useMemo } from "react";
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
import { DEFAULT_CLEAR_RATE_SEARCH_RANGE, DEFAULT_KPM_SEARCH_RANGE } from "@/app/timeline/_lib/consts";
import type { FilterMode } from "@/app/timeline/_lib/type";
import { Button } from "@/components/ui/button";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioCard, RadioGroup } from "@/components/ui/radio-group/radio-group";
import { TooltipWrapper } from "@/components/ui/tooltip";
import useSearchKeydown from "../../_lib/hooks/use-search-keydown";

const SearchPopover = () => {
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
          label={"kpm"}
          min={DEFAULT_KPM_SEARCH_RANGE.min}
          max={DEFAULT_KPM_SEARCH_RANGE.max}
          step={10}
          isMaxLabel
          value={searchKpm}
          setValue={setSearchKpm}
        />
        <SearchRange
          label={"% (クリア率)"}
          min={DEFAULT_CLEAR_RATE_SEARCH_RANGE.min}
          max={DEFAULT_CLEAR_RATE_SEARCH_RANGE.max}
          step={1}
          value={searchClearRate}
          setValue={setSearchClearRate}
        />
        <SearchRange label={"倍速"} min={1} max={2} step={0.25} value={searchSpeed} setValue={setSearchSpeed} />
      </PopoverContent>
    </Popover>
  );
};

const MODE_RADIO_CARDS: { value: FilterMode; label: string }[] = [
  { value: "all", label: "全て" },
  { value: "roma", label: "ローマ字" },
  { value: "kana", label: "かな" },
  { value: "romakana", label: "ローマ字&かな" },
  { value: "english", label: "英語" },
];

const SearchModeRadioCardGroup = () => {
  const modeAtom = useSearchResultModeState();
  const setModeAtom = useSetSearchResultMode();
  const handleKeyDown = useSearchKeydown();

  return (
    <RadioGroup
      value={modeAtom}
      onValueChange={(value) => setModeAtom(value as FilterMode)}
      className="flex gap-1"
      onKeyDown={handleKeyDown}
    >
      {MODE_RADIO_CARDS.map((option) => {
        const isSelected = modeAtom === option.value;

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
  minValue: number;
  maxValue: number;
}

interface SearchRangeProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: RangeValue;
  setValue: (value: RangeValue) => void;
  disabled?: boolean;
  tooltipLabel?: string;
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
  tooltipLabel = "Enterで検索",
}: SearchRangeProps) => {
  const handleKeyDown = useSearchKeydown();

  const handleValueChange = useCallback(
    (newValue: number[]) => {
      setValue({ minValue: newValue[0], maxValue: newValue[1] });
    },
    [setValue],
  );

  const displayValue = useMemo(() => {
    const maxLabel = isMaxLabel && value.maxValue === max ? "最大" : value.maxValue;
    const displayUnit = label;

    return `${value.minValue} - ${maxLabel} ${displayUnit}`;
  }, [value, label, isMaxLabel, max]);

  return (
    <div className="space-y-3 py-4">
      <Label>{displayValue}</Label>
      <TooltipWrapper label={tooltipLabel} disabled={disabled}>
        <DualRangeSlider
          value={[value.minValue, value.maxValue]}
          min={min}
          max={max}
          step={step}
          onValueChange={handleValueChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-label={`${label}の範囲を設定`}
        />
      </TooltipWrapper>
    </div>
  );
};

export default SearchPopover;
