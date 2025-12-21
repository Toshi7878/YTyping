"use client";
import type { ConvertOption } from "@/app/edit/_lib/atoms/storage";
import { setWordConvertOption, useWordConvertOptionState } from "@/app/edit/_lib/atoms/storage";
import { LOOSE_SYMBOL_LIST, MANDATORY_SYMBOL_LIST, STRICT_SYMBOL_LIST } from "@/app/edit/_lib/const";
import { Label } from "@/components/ui/label";
import { RadioButton, RadioGroup } from "@/components/ui/radio-group/radio-group";
import { TooltipWrapper } from "@/components/ui/tooltip";

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

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline">
      <Label className="whitespace-nowrap text-sm">読み変換</Label>
      <RadioGroup
        value={wordConvertOption}
        onValueChange={(value) => setWordConvertOption(value as ConvertOption)}
        className="flex flex-col gap-2 sm:flex-row"
      >
        {CONVERT_OPTIONS.map((option) => (
          <ConvertOptionButton key={option.value} option={option} isActive={wordConvertOption === option.value} />
        ))}
      </RadioGroup>
    </div>
  );
};

const ConvertOptionButton = ({ option, isActive }: { option: (typeof CONVERT_OPTIONS)[number]; isActive: boolean }) => {
  return (
    <TooltipWrapper
      key={option.value}
      label={
        <div>
          <div>{option.description}</div>
          <div>変換される記号: {option.symbolList.join(" ")}</div>
        </div>
      }
      side="bottom"
    >
      <RadioButton
        value={option.value}
        className="h-10 w-full text-xs sm:h-[50px] sm:w-[120px] sm:text-sm md:w-[150px]"
        variant={isActive ? option.activeVariant : option.inactiveVariant}
      >
        {option.label}
      </RadioButton>
    </TooltipWrapper>
  );
};
