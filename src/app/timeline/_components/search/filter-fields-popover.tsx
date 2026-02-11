"use client";
import type { SetStateAction } from "jotai";
import type { ComponentProps, Dispatch } from "react";
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
import { CLEAR_RATE_LIMIT, KPM_LIMIT, PLAY_SPEED_LIMIT, type RESULT_INPUT_METHOD_TYPES } from "@/validator/result";
import { useSetSearchParams } from "../../_lib/use-set-search-params";

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
      <PopoverContent className="w-screen sm:w-fit" align="start">
        <SearchModeRadioCardGroup />
        <SearchRange
          label="kpm"
          min={KPM_LIMIT.min}
          max={KPM_LIMIT.max}
          step={10}
          isMaxLabel
          value={searchKpm}
          setValue={setSearchKpm}
        />
        <SearchRange
          label="% (クリア率)"
          min={CLEAR_RATE_LIMIT.min}
          max={CLEAR_RATE_LIMIT.max}
          step={1}
          value={searchClearRate}
          setValue={setSearchClearRate}
        />
        <SearchRange
          label="倍速"
          min={PLAY_SPEED_LIMIT.min}
          max={PLAY_SPEED_LIMIT.max}
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
  const setSearchParams = useSetSearchParams();

  const MODE_RADIO_CARDS: { label: string; value: (typeof RESULT_INPUT_METHOD_TYPES)[number] | "all" }[] = [
    { label: "全て", value: "all" },
    { label: "ローマ字", value: "roma" },
    { label: "かな", value: "kana" },
    { label: "ローマ字&かな", value: "romakana" },
    { label: "英語", value: "english" },
  ];

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchParams({ mode });
    }
  };

  return (
    <RadioGroup
      value={mode ?? "all"}
      onValueChange={(value: (typeof RESULT_INPUT_METHOD_TYPES)[number] | "all") =>
        setMode(value === "all" ? null : value)
      }
      className="flex flex-wrap gap-1"
      onKeyDown={onKeyDown}
    >
      {MODE_RADIO_CARDS.map((option) => {
        const isSelected = (mode ?? "all") === option.value;

        return (
          <TooltipWrapper key={option.value} label="Enterで検索" disabled={!isSelected} asChild>
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
  isMaxLabel = false,
}: SearchRangeProps & Omit<ComponentProps<typeof DualRangeSlider>, "value" | "label">) => {
  const setSearchParams = useSetSearchParams();

  const handleValueChange = (newValue: number[]) => {
    setValue({ min: newValue[0] ?? 0, max: newValue[1] ?? 0 });
  };

  const displayValue = formatDisplayValue(value, label, max ?? 0, isMaxLabel);

  return (
    <div className="space-y-3 py-4">
      <Label>{displayValue}</Label>
      <TooltipWrapper label="Enterで検索" asChild>
        <DualRangeSlider
          value={[value.min, value.max]}
          min={min}
          max={max}
          step={step}
          onValueChange={handleValueChange}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              setSearchParams();
            }
          }}
          aria-label={`${label}の範囲を設定`}
        />
      </TooltipWrapper>
    </div>
  );
};

const formatDisplayValue = (value: RangeValue, label: string, max: number, isMaxLabel: boolean) => {
  const maxLabel = isMaxLabel && value.max === max ? "最大" : value.max;
  const displayUnit = label;
  return `${value.min} - ${maxLabel} ${displayUnit}`;
};
