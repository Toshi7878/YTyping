"use client";

import { useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { readYTPlayerStatus, setTimeRangeValue, setYTSpeed, useYTSpeedState } from "@/app/edit/_lib/atoms/state";
import { CounterInput } from "@/components/ui/counter";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { YouTubeSpeed } from "@/utils/types";
import { readYTPlayer } from "../_lib/atoms/ref";
import { useTimeRangeValueState, useYTDurationState } from "../_lib/atoms/state";

export const TimeRangeAndSpeedChange = ({ className }: { className: string }) => {
  return (
    <section className={cn(className)}>
      <TimeRange />
      <EditSpeedChange />
    </section>
  );
};

const TimeRange = () => {
  const timeRangeValue = useTimeRangeValueState();
  const ytDuration = useYTDurationState();

  const arrowSeek = useArrowSeek();

  const handleRangeChange = (value: number) => {
    setTimeRangeValue(value);
    const YTPlayer = readYTPlayer();
    if (!YTPlayer) return;

    YTPlayer.playVideo();
    YTPlayer.seekTo(value, true);
  };

  useHotkeys(
    ["arrowleft", "arrowright"],
    (event) => {
      const isDialogOpen = document.querySelector('[role="dialog"]') !== null;
      if (isDialogOpen) return;
      arrowSeek(event);
    },
    {
      enableOnFormTags: false,
      preventDefault: true,
      ignoreModifiers: true,
    },
  );

  return (
    <Slider
      min={0}
      step={0.1}
      id="time-range"
      value={[timeRangeValue]}
      onValueChange={(value) => handleRangeChange(value[0] ?? 0)}
      onKeyDown={(event) => arrowSeek(event)}
      max={ytDuration}
      className="w-full"
    />
  );
};

const EditSpeedChange = () => {
  const speed = useYTSpeedState();

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

const useArrowSeek = () => {
  return useCallback((event: KeyboardEvent | React.KeyboardEvent<HTMLDivElement>) => {
    const YTPlayer = readYTPlayer();
    if (!YTPlayer) return;
    const ARROW_SEEK_SECONDS = 3;

    const { speed } = readYTPlayerStatus();

    const time = YTPlayer.getCurrentTime();
    const seekAmount = ARROW_SEEK_SECONDS * speed;
    if (event.key === "ArrowLeft") {
      YTPlayer.seekTo(time - seekAmount, true);
    } else if (event.key === "ArrowRight") {
      YTPlayer.seekTo(time + seekAmount, true);
    }
    event.preventDefault();
  }, []);
};
