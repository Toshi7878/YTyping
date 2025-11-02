"use client";

import { useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useReadYtPlayerStatus, useYTSpeedState } from "@/app/edit/_lib/atoms/state-atoms";
import { CounterInput } from "@/components/ui/counter";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { YouTubeSpeed } from "@/utils/types";
import { usePlayer } from "../_lib/atoms/read-atoms";
import {
  useSetTimeRangeValue,
  useSetYTSpeed,
  useTimeRangeValueState,
  useYTDurationState,
} from "../_lib/atoms/state-atoms";

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
  const arrowSeek = useArrowSeek();

  const handleRangeChange = (value: number) => {
    setTimeRangeValue(value);
    const player = readPlayer();
    player.playVideo();
    player.seekTo(value, true);
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

const useArrowSeek = () => {
  const readYtPlayerStatus = useReadYtPlayerStatus();
  const { readPlayer } = usePlayer();

  return useCallback(
    (event: KeyboardEvent | React.KeyboardEvent<HTMLDivElement>) => {
      const ARROW_SEEK_SECONDS = 3;

      const { speed } = readYtPlayerStatus();
      const time = readPlayer().getCurrentTime();
      const seekAmount = ARROW_SEEK_SECONDS * speed;
      if (event.key === "ArrowLeft") {
        readPlayer().seekTo(time - seekAmount, true);
      } else if (event.key === "ArrowRight") {
        readPlayer().seekTo(time + seekAmount, true);
      }
      event.preventDefault();
    },
    [readYtPlayerStatus, readPlayer],
  );
};
