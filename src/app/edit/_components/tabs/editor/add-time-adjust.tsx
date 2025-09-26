"use client"

import { useSetTimeOffset, useTimeOffsetState } from "@/app/edit/_lib/atoms/storage-atoms"
import { CounterInput } from "@/components/ui/counter"
import { TooltipWrapper } from "@/components/ui/tooltip"

const MAX_TIME_OFFSET = -0.1
const MIN_TIME_OFFSET = -0.4
const TIME_OFFSET_STEP = 0.01

export default function AddTimeAdjust() {
  const timeOffset = useTimeOffsetState()
  const setTimeOffset = useSetTimeOffset()

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
  )
}
