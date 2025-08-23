"use client";
import { useSetUserTypingOptionsState, useUserTypingOptionsState } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import CounterInput from "./child/CounterInput";

const MAX_TIME_OFFSET = 1;
const MIN_TIME_OFFSET = -1;
const TIME_OFFSET_STEP = 0.05;

const UserTimeOffsetChange = () => {
  const { setUserTypingOptions } = useSetUserTypingOptionsState();
  const { time_offset } = useUserTypingOptionsState();

  return (
    <CounterInput
      value={time_offset}
      onChange={(value) => setUserTypingOptions({ time_offset: value })}
      step={TIME_OFFSET_STEP}
      max={MAX_TIME_OFFSET}
      min={MIN_TIME_OFFSET}
      valueDigits={2}
      decrementTooltip="タイミングが早くなります"
      incrementTooltip="タイミングが遅くなります"
      label={"全体タイミング調整"}
    />
  );
};

export default UserTimeOffsetChange;
