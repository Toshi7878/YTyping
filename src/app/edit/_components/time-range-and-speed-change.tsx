"use client";

import { useHotkeys } from "react-hotkeys-hook";
import { readYTPlayerStatus, setTimeRangeValue, useMediaSpeedState } from "@/app/edit/_lib/atoms/state";
import { CounterInput } from "@/components/ui/counter";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { isDialogOpen } from "@/utils/is-dialog-option";
import { useTimeRangeValueState, useYTDurationState } from "../_lib/atoms/state";
import { getYTCurrentTime, playYTPlayer, seekYTPlayer, setYTPlaybackRate } from "../_lib/atoms/youtube-player";

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

  const handleRangeChange = (value: number) => {
    setTimeRangeValue(value);
    playYTPlayer();
    seekYTPlayer(value);
  };

  useHotkeys(
    ["arrowleft", "arrowright"],
    (event) => {
      if (isDialogOpen()) return;
      handleArrowSeek(event);
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
      onKeyDown={handleArrowSeek}
      max={ytDuration}
      className="w-full"
    />
  );
};

const EditSpeedChange = () => {
  const speed = useMediaSpeedState();

  return (
    <CounterInput
      variant="minimal"
      value={speed}
      max={2}
      min={0.25}
      step={0.25}
      valueDigits={2}
      onChange={(value: number) => setYTPlaybackRate(value)}
      unit="倍速"
      minusButtonHotkey="f9"
      plusButtonHotkey="f10"
    />
  );
};

const handleArrowSeek = (event: KeyboardEvent | React.KeyboardEvent<HTMLDivElement>) => {
  const ARROW_SEEK_SECONDS = 3;
  const { mediaSpeed } = readYTPlayerStatus();
  const time = getYTCurrentTime();
  if (!time) return;
  const seekAmount = ARROW_SEEK_SECONDS * mediaSpeed;
  if (event.key === "ArrowLeft") {
    seekYTPlayer(time - seekAmount);
  } else if (event.key === "ArrowRight") {
    seekYTPlayer(time + seekAmount);
  }
  event.preventDefault();
};
