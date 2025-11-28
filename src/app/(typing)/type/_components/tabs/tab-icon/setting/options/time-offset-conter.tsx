"use client";
import { setTypingOptions, useTypingOptionsState } from "@/app/(typing)/type/_lib/atoms/hydrate";
import { CounterInput } from "@/components/ui/counter";

const MAX_TIME_OFFSET = 1;
const MIN_TIME_OFFSET = -1;
const TIME_OFFSET_STEP = 0.05;

export const TimeOffsetCounter = () => {
  const { timeOffset } = useTypingOptionsState();
  return (
    <CounterInput
      value={timeOffset}
      onChange={(value) => setTypingOptions({ timeOffset: value })}
      step={TIME_OFFSET_STEP}
      max={MAX_TIME_OFFSET}
      min={MIN_TIME_OFFSET}
      valueDigits={2}
      decrementTooltip="タイミングが早くなります"
      incrementTooltip="タイミングが遅くなります"
      label="全体タイミング調整"
      size="lg"
    />
  );
};
