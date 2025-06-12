"use client";
import "@/app/edit/style/editor.scss";
import React, { useCallback, useEffect, useRef } from "react";
import { useIsYTReadiedState, useIsYTStartedState } from "../../atoms/stateAtoms";

import { usePlayer, useTimeRange } from "../../atoms/refAtoms";
import ColorStyle from "../ColorStyle";
import EditSpeedChange from "./child/SpeedChange";

const TimeRange = () => {
  const rangeRef = useRef<HTMLInputElement>(null);
  const isYTStarted = useIsYTStartedState();
  const isYTReady = useIsYTReadiedState();
  const { readPlayer } = usePlayer();
  const { writeTimeRange } = useTimeRange();

  useEffect(() => {
    if (rangeRef.current) {
      writeTimeRange(rangeRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRangeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    rangeRef.current!.value = e.target.value;
    const player = readPlayer();
    player.playVideo();

    if (player) {
      player.seekTo(time, true);
    }
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const progress = (time / Number(e.target.max)) * 100;
    e.target.style.background = `linear-gradient(to right, hsl(var(--primary)) ${progress}%, hsl(var(--foreground) / 0.3) ${progress}%)`;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const player = readPlayer();
    if (player && (isYTReady || isYTStarted)) {
      const duration = player.getDuration().toFixed(3);
      if (duration !== undefined) {
        rangeRef.current!.max = duration;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isYTReady, isYTStarted]);

  return (
    <>
      <input
        min="0"
        step="0.1"
        id="time-range"
        type="range"
        ref={rangeRef}
        value={0}
        onChange={handleRangeChange}
        className="w-full cursor-pointer"
      />
      <ColorStyle />

      <EditSpeedChange />
    </>
  );
};

export default TimeRange;
