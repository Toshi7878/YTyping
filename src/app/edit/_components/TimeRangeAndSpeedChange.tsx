"use client";
import "@/app/edit/_lib/style/editor.scss";
import { useSetTimeRangeValue, useTimeRangeValueState, useYTDurationState } from "../_lib/atoms/stateAtoms";

import { useSpeedReducer, useYTSpeedState } from "@/app/edit/_lib/atoms/stateAtoms";
import "@/app/edit/_lib/style/editor.scss";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
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
  const speedDispatch = useSpeedReducer();

  return (
    <div className="flex w-[170px] items-center justify-center gap-2">
      <Button variant="ghost" size="sm" onClick={() => speedDispatch("down")} className="h-auto p-1">
        <div className="relative">
          -<span className="f-key">F9</span>
        </div>
      </Button>
      <div>
        <span id="speed">{speed.toFixed(2)}</span>
        倍速
      </div>
      <Button variant="ghost" size="sm" onClick={() => speedDispatch("up")} className="h-auto p-1">
        <div className="relative">
          +<span className="f-key">F10</span>
        </div>
      </Button>
    </div>
  );
};
