"use client";

import { atom, useAtomValue } from "jotai";
import { useHotkeys } from "react-hotkeys-hook";
import { Slider } from "@/ui/slider";
import { isDialogOpen } from "@/utils/is-dialog-option";
import { store } from "../provider";
import { useYTDuration, YTPlayer } from "../youtube-player";

const timeRangeAtom = atom(0);
export const setTimeRangeValue = (value: number) => store.set(timeRangeAtom, value);

export const TimeRange = () => {
  const timeRangeValue = useAtomValue(timeRangeAtom);
  const duration = useYTDuration();

  const handleRangeChange = (value: number) => {
    setTimeRangeValue(value);
    YTPlayer.play();
    YTPlayer.seek(value);
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
      max={duration}
      className="w-full"
    />
  );
};

const handleArrowSeek = (event: KeyboardEvent | React.KeyboardEvent<HTMLDivElement>) => {
  const ARROW_SEEK_SECONDS = 3;
  const mediaSpeed = YTPlayer.getSpeed();
  const time = YTPlayer.getCurrentTime();
  if (!time) return;
  const seekAmount = ARROW_SEEK_SECONDS * mediaSpeed;
  if (event.key === "ArrowLeft") {
    YTPlayer.seek(time - seekAmount);
  } else if (event.key === "ArrowRight") {
    YTPlayer.seek(time + seekAmount);
  }
  event.preventDefault();
};
