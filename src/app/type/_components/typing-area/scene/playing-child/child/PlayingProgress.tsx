import { useMapAtom, useSceneAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import { useRefs } from "@/app/type/type-contexts/refsProvider";
import { ThemeColors } from "@/types";
import { Box, useTheme } from "@chakra-ui/react";
import React, { useEffect } from "react";

interface PlayingProgressProps {
  id: string;
}
const PlayingProgress = (props: PlayingProgressProps) => {
  const { setRef, ytStateRef } = useRefs();
  const theme: ThemeColors = useTheme();
  const progressRef = React.useRef<HTMLProgressElement>(null);
  const scene = useSceneAtom();
  const map = useMapAtom();

  useEffect(() => {
    if (progressRef.current) {
      setRef(props.id, progressRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (props.id === "total_progress" && scene !== "ready" && map) {
      const movieDuration = ytStateRef.current!.movieDuration;
      const duration =
        Number(map?.movieTotalTime) > movieDuration ? movieDuration : map?.movieTotalTime;
      progressRef.current!.max = duration;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, scene]);

  return (
    <>
      <Box>
        <progress id={props.id} ref={progressRef} className="w-full" />
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
