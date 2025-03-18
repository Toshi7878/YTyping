import { useProgress, useYTStatusRef } from "@/app/type/atoms/refAtoms";
import { useMapState, useSceneState } from "@/app/type/atoms/stateAtoms";
import { ThemeColors } from "@/types";
import { Box, useTheme } from "@chakra-ui/react";
import React, { useEffect } from "react";

interface PlayingProgressProps {
  id: string;
}
const PlayingProgress = (props: PlayingProgressProps) => {
  const theme: ThemeColors = useTheme();
  const progressRef = React.useRef<HTMLProgressElement>(null);
  const scene = useSceneState();
  const map = useMapState();

  const { writeLineProgress, writeTotalProgress } = useProgress();
  const { readYTStatus } = useYTStatusRef();

  useEffect(() => {
    if (progressRef.current) {
      if (props.id === "line_progress") {
        writeLineProgress(progressRef.current!);
      } else {
        writeTotalProgress(progressRef.current!);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (props.id === "total_progress" && scene !== "ready" && map) {
      const movieDuration = readYTStatus().movieDuration;
      const duration = Number(map.movieTotalTime) > movieDuration ? movieDuration : map.movieTotalTime;
      progressRef.current!.max = duration;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, scene]);

  return (
    <>
      <Box>
        <progress id={props.id} ref={progressRef} className="w-full h-[20px] md:h-[10px]" />
      </Box>
      <style>
        {`#${props.id}::-webkit-progress-value {
          background: ${theme.colors.primary.main};
            border-radius: 5px;
          }`}
      </style>
    </>
  );
};

export default PlayingProgress;
