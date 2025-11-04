"use client";
import { useMemo } from "react";
import type { ConvertOption } from "@/app/edit/_lib/atoms/storage";
import { setWordConvertOption, useWordConvertOptionState } from "@/app/edit/_lib/atoms/storage";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group/radio-group";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { LOOSE_SYMBOL_LIST, MANDATORY_SYMBOL_LIST, STRICT_SYMBOL_LIST } from "@/lib/build-map/const";

const CONVERT_OPTIONS = [
  {
    value: "non_symbol",
    label: "記号なし(一部除く)",
    activeVariant: "success",
    inactiveVariant: "outline-success",
    description: "一部の記号を除いてワードに記号を含まずよみ変換します。",
    symbolList: MANDATORY_SYMBOL_LIST,
  },
  {
    value: "add_symbol",
    label: "記号あり(一部)",
    activeVariant: "warning",
    inactiveVariant: "outline-warning",
    description: "一部の記号をよみ変換されるようにします。",
    symbolList: [...MANDATORY_SYMBOL_LIST, ...LOOSE_SYMBOL_LIST],
  },
  {
    value: "add_symbol_all",
    label: "記号あり(すべて)",
    activeVariant: "destructive",
    inactiveVariant: "outline-destructive",
    description: "キーボードで入力できる全ての記号をよみ変換されるようにします。",
    symbolList: [...MANDATORY_SYMBOL_LIST, ...LOOSE_SYMBOL_LIST, ...STRICT_SYMBOL_LIST],
  },
] as const;

export const ConvertOptionButtons = () => {
  const wordConvertOption = useWordConvertOptionState();

  const optionButtons = useMemo(
    () =>
      CONVERT_OPTIONS.map((option) => {
        const { activeVariant, inactiveVariant, description, symbolList } = option;
        const isActive = wordConvertOption === option.value;

        return {
          ...option,
          variant: isActive ? activeVariant : inactiveVariant,
          tooltipLabel: (
            <div>
              <div>{description}</div>
              <div>変換される記号: {symbolList.join(" ")}</div>
            </div>
          ),
        };
      }),
    [wordConvertOption],
  );

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline">
      <Label className="text-sm whitespace-nowrap">読み変換</Label>
      <RadioGroup
        value={wordConvertOption}
        onValueChange={(value) => setWordConvertOption(value as ConvertOption)}
        className="flex flex-col gap-2 sm:flex-row"
      >
        {optionButtons.map((option) => (
          <TooltipWrapper key={option.value} label={option.tooltipLabel} side="bottom">
            <Button
              variant={option.variant}
              size="sm"
              className="h-10 w-full text-xs sm:h-[50px] sm:w-[120px] sm:text-sm md:w-[150px]"
              onClick={() => setWordConvertOption(option.value)}
            >
              {option.label}
            </Button>
          </TooltipWrapper>
        ))}
      </RadioGroup>
    </div>
  );
};
