"use client";

import { useSetTimeOffset, useTimeOffsetState } from "@/app/edit/atoms/storageAtoms";
import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "@/components/ui/tooltip";

const MAX_TIME_OFFSET = -0.1;
const MIN_TIME_OFFSET = -0.4;
const TIME_OFFSET_STEP = 0.01;

export default function AddTimeAdjust() {
  const timeOffset = useTimeOffsetState();
  const setTimeOffset = useSetTimeOffset();

  return (
    <CounterInput
      value={timeOffset}
      onChange={(value) => setTimeOffset(value)}
      step={TIME_OFFSET_STEP}
      max={MAX_TIME_OFFSET}
      min={MIN_TIME_OFFSET}
      valueDigits={2}
      label="タイム補正"
    />
  );
}

interface CounterInputProps {
  value: number;
  label: string;
  max: number;
  min: number;
  step: number;
  valueDigits: number;
  onChange: (value: number) => void;
}

const CounterInput = ({ value, label, max, min, step, valueDigits, onChange }: CounterInputProps) => {
  const onCounterChange = ({ type }: { type: "increment" | "decrement" }) => {
    const newValue = type === "increment" ? Math.min(max, value + step) : Math.max(min, value - step);
    const newValueFixed = Number(newValue.toFixed(valueDigits));
    onChange(newValueFixed);
  };

  return (
    <TooltipWrapper
      label={
        <>
          <div>再生中に追加・変更を行う場合に、数値分補正してタイムを記録します。</div>
          <div>
            <span className="text-xs">
              譜面のタイムは、歌いだしの瞬間より-0.2 ~ -0.25秒程早めに設定すると丁度よいタイミングになります。
            </span>
            <span className="text-xs">※間奏などでワードが存在しない場合は追加タイム補正は適用されません。</span>
            <span className="text-xs">
              Bluetoothキーボードや無線イヤホンなど環境に合わせて最適な補正値に調整してください。
            </span>
          </div>
        </>
      }
    >
      <div className="flex items-baseline">
        <span className="mr-2 text-sm">{label}</span>
        <div className="border-border/50 flex w-fit items-baseline rounded-full border px-2">
          <Button
            onClick={() => onCounterChange({ type: "decrement" })}
            size="sm"
            variant="ghost"
            className="h-auto p-1"
          >
            -
          </Button>
          <div className="px-2 text-xs">{value.toFixed(valueDigits)}</div>
          <Button
            onClick={() => onCounterChange({ type: "increment" })}
            size="sm"
            variant="ghost"
            className="h-auto p-1"
          >
            +
          </Button>
        </div>
      </div>
    </TooltipWrapper>
  );
};
