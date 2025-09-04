"use client";
import {
  useSetTimeRangeValue,
  useSetYTSpeed,
  useTimeRangeValueState,
  useYTDurationState,
} from "../_lib/atoms/stateAtoms";

import { useYTSpeedState } from "@/app/edit/_lib/atoms/stateAtoms";
import { CounterInput } from "@/components/ui/counter";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { YouTubeSpeed } from "@/types";
import { usePlayer } from "../_lib/atoms/refAtoms";

export const TimeRangeAndSpeedChange = ({ className }: { className: string }) => {
  return (
    <section className={cn(className)}>
      <TimeRange />
      <EditSpeedChange />
    </section>
  );
};

const TimeRange = () => {
  const { readPlayer } = usePlayer();

  const timeRangeValue = useTimeRangeValueState();
  const ytDuration = useYTDurationState();

  const setTimeRangeValue = useSetTimeRangeValue();

  const handleRangeChange = (value: number[]) => {
    const time = value[0];
    setTimeRangeValue(time);
    const player = readPlayer();
    player.playVideo();
    player.seekTo(time, true);
  };

  return (
    <Slider
      min={0}
      step={0.1}
      id="time-range"
      value={[timeRangeValue]}
      onValueChange={handleRangeChange}
      max={ytDuration}
      className="w-full"
    />
  );
};

const EditSpeedChange = () => {
  const speed = useYTSpeedState();
  const setYTSpeed = useSetYTSpeed();

  return (
    <CounterInput
      variant="minimal"
      value={speed}
      max={2}
      min={0.25}
      step={0.25}
      valueDigits={2}
      onChange={(value: number) => setYTSpeed(value as YouTubeSpeed)}
      unit="倍速"
      minusButtonHotkey="f9"
      plusButtonHotkey="f10"
    />
  );
};
