"use client";

import type { ExtractAtomValue } from "jotai";
import { useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { store } from "@/app/edit/_feature/provider";
import { CounterInput } from "@/ui/counter";
import { TooltipWrapper } from "@/ui/tooltip";

const timeOffsetAtom = atomWithStorage("editor_playing_time_offset", -0.2, undefined, {
  getOnInit: true,
});

export const setTimeOffset = (value: ExtractAtomValue<typeof timeOffsetAtom>) => store.set(timeOffsetAtom, value);
export const getTimeOffset = () => store.get(timeOffsetAtom);

const MAX_TIME_OFFSET = -0.1;
const MIN_TIME_OFFSET = -0.4;
const TIME_OFFSET_STEP = 0.01;

export const AddTimeAdjust = () => {
  const timeOffset = useAtomValue(timeOffsetAtom, { store });

  return (
    <TooltipWrapper
      delayDuration={300}
      label={
        <div>
          <div>
            <strong>推奨設定：補正値 -0.2～-0.25秒</strong>
            <div className="mt-2 space-y-2">
              <div>
                <span className="font-medium">機能：</span>
                YouTube再生中に行を追加・変更する際、設定値分だけタイムを自動補正して記録します
              </div>
              <div>
                <span className="font-medium">効果：</span>
                歌詞1行の歌いだしの瞬間に追加ボタンを押すと、タイミング良く記録することができます。
              </div>
            </div>

            <div className="mt-2">
              Bluetoothキーボードや無線イヤホン使用時は、遅延に合わせて補正値を調整してください
            </div>
          </div>
        </div>
      }
    >
      {/* tooltipを使用しているためdivでラップしている */}
      <div>
        <CounterInput
          value={timeOffset}
          onChange={(value) => setTimeOffset(value)}
          step={TIME_OFFSET_STEP}
          max={MAX_TIME_OFFSET}
          min={MIN_TIME_OFFSET}
          valueDigits={2}
          label="追加タイム補正"
          size="sm"
        />
      </div>
    </TooltipWrapper>
  );
};
