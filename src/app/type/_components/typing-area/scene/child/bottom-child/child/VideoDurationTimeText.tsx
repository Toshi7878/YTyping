import { formatTime } from "@/app/type/ts/scene-ts/playing/formatTime";
import { useMapAtom, useTypePageSpeedAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import { useRefs } from "@/app/type/type-contexts/refsProvider";
import { Text } from "@chakra-ui/react";
import React from "react";

const VideoDurationTimeText = () => {
  const { ytStateRef } = useRefs();
  const map = useMapAtom();
  const speedData = useTypePageSpeedAtom();

  const movieDuration = ytStateRef.current!.movieDuration;
  const duration =
    Number(map?.movieTotalTime) > movieDuration ? movieDuration : map?.movieTotalTime;
  const totalTime = formatTime(map ? Number(duration) / speedData.playSpeed : 0);

  return (
    <Text as="span" id="total_time">
      {totalTime}
    </Text>
  );
};

export default VideoDurationTimeText;
