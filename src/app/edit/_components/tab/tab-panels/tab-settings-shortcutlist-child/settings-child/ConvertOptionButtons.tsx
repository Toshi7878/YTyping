"use client";
import { useSetWordConvertOption, useWordConvertOptionState } from "@/app/edit/atoms/storageAtoms";
import { ConvertOptionsType } from "@/app/edit/ts/type";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { LOOSE_SYMBOL_LIST, MANDATORY_SYMBOL_LIST, STRICT_SYMBOL_LIST } from "@/config/consts/charList";
import { useMemo } from "react";

export default function ConvertOptionButtons() {
  const wordConvertOption = useWordConvertOptionState();
  const setWordConvertOption = useSetWordConvertOption();

  const options = useMemo(
    () => [
      {
        colorScheme: "green",
        label: "記号なし(一部除く)",
        value: "non_symbol",
        tooltipLabel: (
          <div>
            <div>一部の記号を除いてワードに記号を含まずよみ変換します。</div>
            <div>変換される記号:{MANDATORY_SYMBOL_LIST.join(" ")}</div>
          </div>
        ),
      },
      {
        colorScheme: "yellow",
        label: "記号あり(一部)",
        value: "add_symbol",
        tooltipLabel: (
          <div>
            <div>一部の記号をよみ変換されるようにします。</div>
            <div>変換される記号:{MANDATORY_SYMBOL_LIST.concat(LOOSE_SYMBOL_LIST).join(" ")}</div>
          </div>
        ),
      },
      {
        colorScheme: "red",
        label: "記号あり(すべて)",
        value: "add_symbol_all",
        tooltipLabel: (
          <div>
            <div>キーボードで入力できる全ての記号をよみ変換されるようにします。</div>
            <div>
              変換される記号:
              {MANDATORY_SYMBOL_LIST.concat(LOOSE_SYMBOL_LIST).concat(STRICT_SYMBOL_LIST).join(" ")}
            </div>
          </div>
        ),
      },
    ],
    []
  );

  const getColorClasses = (colorScheme: string, isSelected: boolean) => {
    const colorMap: { [key: string]: string } = {
      green: isSelected ? "bg-green-500 hover:bg-green-600 text-white" : "border-green-500 text-green-600 hover:bg-green-50",
      yellow: isSelected ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "border-yellow-500 text-yellow-600 hover:bg-yellow-50",
      red: isSelected ? "bg-red-500 hover:bg-red-600 text-white" : "border-red-500 text-red-600 hover:bg-red-50",
    };
    return colorMap[colorScheme] || "";
  };

  return (
    <div className="flex items-baseline gap-2">
      <Label className="text-sm">読み変換</Label>

      <RadioGroup
        onValueChange={(nextValue: string) => setWordConvertOption(nextValue as ConvertOptionsType)}
        value={wordConvertOption}
      >
        <div className="flex gap-2">
          {options.map((option) => (
            <TooltipWrapper label={option.tooltipLabel} key={option.label} side="bottom">
              <Button
                variant={wordConvertOption === option.value ? "default" : "outline"}
                size="sm"
                className={`w-[150px] h-[50px] ${getColorClasses(option.colorScheme, wordConvertOption === option.value)}`}
                onClick={() => setWordConvertOption(option.value as ConvertOptionsType)}
              >
                {option.label}
              </Button>
            </TooltipWrapper>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}
