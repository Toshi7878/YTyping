"use client";

import { useSetTimeOffset, useTimeOffsetState } from "@/app/edit/_lib/atoms/storageAtoms";
import { CounterInput } from "@/components/ui/counter";
import { TooltipWrapper } from "@/components/ui/tooltip";

const MAX_TIME_OFFSET = -0.1;
const MIN_TIME_OFFSET = -0.4;
const TIME_OFFSET_STEP = 0.01;

export default function AddTimeAdjust() {
  const timeOffset = useTimeOffsetState();
  const setTimeOffset = useSetTimeOffset();

  return (
    <TooltipWrapper
      delayDuration={600}
      label={
        <>
          <div>再生中に追加・変更を行う場合に、数値分補正してタイムを記録します。</div>
          <div>
            <div className="text-xs">
              譜面のタイムは、歌いだしの瞬間より-0.2 ~ -0.25秒程早めに設定すると丁度よいタイミングになります。
            </div>
            <br />
            <div className="text-xs">※間奏などでワードが存在しない場合は追加タイム補正は適用されません。</div>
            <div className="text-xs">
              Bluetoothキーボードや無線イヤホンなど環境に合わせて最適な補正値に調整してください。
            </div>
          </div>
        </>
      }
    >
      <CounterInput
        value={timeOffset}
        onChange={(value) => setTimeOffset(value)}
        step={TIME_OFFSET_STEP}
        max={MAX_TIME_OFFSET}
        min={MIN_TIME_OFFSET}
        valueDigits={2}
        label="タイム補正"
        size="sm"
      />
    </TooltipWrapper>
  );
}
