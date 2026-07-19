"use client";

import { CounterInput } from "@/ui/counter";
import { useYTSpeed, YTPlayer } from "../youtube-player";

export const SpeedCounter = () => {
  const speed = useYTSpeed();

  return (
    <CounterInput
      variant="minimal"
      value={speed}
      max={2}
      min={0.25}
      step={0.25}
      valueDigits={2}
      onChange={(value: number) => YTPlayer.setSpeed(value)}
      unit="倍速"
      minusButtonHotkey="f9"
      plusButtonHotkey="f10"
    />
  );
};
