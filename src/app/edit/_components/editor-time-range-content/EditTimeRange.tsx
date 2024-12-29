"use client";
import "@/app/edit/style/editor.scss";
import { ThemeColors } from "@/types";
import { Box, useTheme } from "@chakra-ui/react";
import React, { useCallback, useEffect, useRef } from "react";
import { useIsEditYTReadyAtom, useIsEditYTStartedAtom } from "../../edit-atom/editAtom";
import { useRefs } from "../../edit-contexts/refsProvider";

import EditSpeedChange from "./child/EditSpeedChange";
const TimeRange = () => {
  const { playerRef, setRef } = useRefs();

  const rangeRef = useRef<HTMLInputElement>(null);
  const theme: ThemeColors = useTheme();

  const isYTStarted = useIsEditYTStartedAtom();
  const isYTReady = useIsEditYTReadyAtom();

  useEffect(() => {
    setRef("rangeRef", rangeRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRangeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    rangeRef.current!.value = e.target.value;
    playerRef.current.playVideo();

    if (playerRef.current) {
      playerRef.current.seekTo(time);
    }
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const progress = (time / Number(e.target.max)) * 100;
    e.target.style.background = `linear-gradient(to right, ${theme.colors.primary.main} ${progress}%, ${theme.colors.text.body}30 ${progress}%)`;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isYTReady || isYTStarted) {
      const duration = playerRef.current?.getDuration().toFixed(3);
      if (duration !== undefined) {
        rangeRef.current!.max = duration;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isYTReady, isYTStarted]);

  return (
    <Box display="grid" gridTemplateColumns="1fr auto" gap-y="1px" alignItems="center">
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
      <EditSpeedChange />
    </Box>
  );
};

export default TimeRange;
