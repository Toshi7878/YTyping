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

type OptionButton = {
  variant: VariantProps<typeof buttonVariants>["variant"];
  label: string;
  value: ConvertOptionsType;
  tooltipLabel: React.ReactNode;
};

export default function ConvertOptionButtons() {
  const wordConvertOption = useWordConvertOptionState();
  const setWordConvertOption = useSetWordConvertOption();

  const options: OptionButton[] = useMemo(
    () => [
      {
        variant: wordConvertOption === "non_symbol" ? "success" : "outline-success",
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
        variant: wordConvertOption === "add_symbol" ? "warning" : "outline-warning",
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
        variant: wordConvertOption === "add_symbol_all" ? "error" : "outline-error",
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
    [wordConvertOption],
  );

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
                variant={option.variant}
                size="sm"
                className={`h-[50px] w-[150px]`}
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
