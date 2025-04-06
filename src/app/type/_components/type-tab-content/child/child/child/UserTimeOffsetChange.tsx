"use client";
import { useSetUserTypingOptionsState, useUserTypingOptionsState } from "@/app/type/atoms/stateAtoms";
import { CounterInput } from "./child/CounterInput";

const CHANGE_TIME_OFFSET_VALUE = 0.05;

const UserTimeOffsetChange = () => {
  const { setUserTypingOptions } = useSetUserTypingOptionsState();
  const { time_offset } = useUserTypingOptionsState();

  const decrement = () => {
    const newValue = Math.round((time_offset - CHANGE_TIME_OFFSET_VALUE) * 100) / 100;

    setUserTypingOptions({ time_offset: Math.max(-1, newValue) });
  };
  const increment = () => {
    const newValue = Math.round((time_offset + CHANGE_TIME_OFFSET_VALUE) * 100) / 100;
    setUserTypingOptions({ time_offset: Math.min(1, newValue) });
  };

  return (
    <CounterInput
      value={time_offset.toFixed(2)}
      onDecrement={decrement}
      onIncrement={increment}
      decrementTooltip="タイミングが早くなります"
      incrementTooltip="タイミングが遅くなります"
      label={"全体タイミング調整"}
    />
  );
};

export default UserTimeOffsetChange;
