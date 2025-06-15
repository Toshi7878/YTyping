"use client";
import { useSetWordConvertOption, useWordConvertOptionState } from "@/app/edit/atoms/storageAtoms";
import { ConvertOptionsType } from "@/app/edit/ts/type";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { LOOSE_SYMBOL_LIST, MANDATORY_SYMBOL_LIST, STRICT_SYMBOL_LIST } from "@/config/consts/charList";
import { VariantProps } from "class-variance-authority";
import { useMemo } from "react";

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];

interface ConvertOption {
  value: ConvertOptionsType;
  label: string;
  shortLabel: string; // モバイル用の短いラベル
  activeVariant: ButtonVariant;
  inactiveVariant: ButtonVariant;
  description: string;
  symbolList: string[];
}

const CONVERT_OPTIONS: ConvertOption[] = [
  {
    value: "non_symbol",
    label: "記号なし(一部除く)",
    shortLabel: "記号なし",
    activeVariant: "success",
    inactiveVariant: "outline-success",
    description: "一部の記号を除いてワードに記号を含まずよみ変換します。",
    symbolList: MANDATORY_SYMBOL_LIST,
  },
  {
    value: "add_symbol",
    label: "記号あり(一部)",
    shortLabel: "記号(一部)",
    activeVariant: "warning",
    inactiveVariant: "outline-warning",
    description: "一部の記号をよみ変換されるようにします。",
    symbolList: [...MANDATORY_SYMBOL_LIST, ...LOOSE_SYMBOL_LIST],
  },
  {
    value: "add_symbol_all",
    label: "記号あり(すべて)",
    shortLabel: "記号(全て)",
    activeVariant: "error",
    inactiveVariant: "outline-error",
    description: "キーボードで入力できる全ての記号をよみ変換されるようにします。",
    symbolList: [...MANDATORY_SYMBOL_LIST, ...LOOSE_SYMBOL_LIST, ...STRICT_SYMBOL_LIST],
  },
];

const getButtonVariant = (option: ConvertOption, isActive: boolean): ButtonVariant => {
  return isActive ? option.activeVariant : option.inactiveVariant;
};

const createTooltipContent = (description: string, symbolList: string[]) => (
  <div>
    <div>{description}</div>
    <div>変換される記号: {symbolList.join(" ")}</div>
  </div>
);

export default function ConvertOptionButtons() {
  const wordConvertOption = useWordConvertOptionState();
  const setWordConvertOption = useSetWordConvertOption();

  const optionButtons = useMemo(
    () =>
      CONVERT_OPTIONS.map((option) => ({
        ...option,
        variant: getButtonVariant(option, wordConvertOption === option.value),
        tooltipLabel: createTooltipContent(option.description, option.symbolList),
      })),
    [wordConvertOption],
  );

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline">
      <Label className="text-sm whitespace-nowrap">読み変換</Label>
      <RadioGroup
        value={wordConvertOption}
        onValueChange={(value: string) => setWordConvertOption(value as ConvertOptionsType)}
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          {optionButtons.map((option) => (
            <TooltipWrapper key={option.value} label={option.tooltipLabel} side="bottom">
              <Button
                variant={option.variant}
                size="sm"
                className="h-10 w-full text-xs sm:h-[50px] sm:w-[120px] sm:text-sm md:w-[150px]"
                onClick={() => setWordConvertOption(option.value)}
              >
                <span className="sm:hidden">{option.shortLabel}</span>
                <span className="hidden sm:inline">{option.label}</span>
              </Button>
            </TooltipWrapper>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}
