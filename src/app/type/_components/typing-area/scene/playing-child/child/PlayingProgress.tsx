import {
  lineProgressRefAtom,
  totalProgressRefAtom,
  ytStateRefAtom,
} from "@/app/type/atoms/refAtoms";
import { useMapAtom, useSceneAtom } from "@/app/type/atoms/stateAtoms";
import { ThemeColors } from "@/types";
import { Box, useTheme } from "@chakra-ui/react";
import { useStore } from "jotai";
import React, { useEffect } from "react";

interface PlayingProgressProps {
  id: string;
}
const PlayingProgress = (props: PlayingProgressProps) => {
  const theme: ThemeColors = useTheme();
  const progressRef = React.useRef<HTMLProgressElement>(null);
  const scene = useSceneAtom();
  const map = useMapAtom();
  const typeAtomStore = useStore();

  useEffect(() => {
    if (progressRef.current) {
      if (props.id === "line_progress") {
        typeAtomStore.set(lineProgressRefAtom, progressRef.current);
      } else {
        typeAtomStore.set(totalProgressRefAtom, progressRef.current);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (props.id === "total_progress" && scene !== "ready" && map) {
      const movieDuration = typeAtomStore.get(ytStateRefAtom).movieDuration;
      const duration =
        Number(map?.movieTotalTime) > movieDuration ? movieDuration : map?.movieTotalTime;
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
