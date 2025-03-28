import { useYTStatusRef } from "@/app/type/atoms/refAtoms";
import { usePlaySpeedState } from "@/app/type/atoms/speedReducerAtoms";
import { useMapState } from "@/app/type/atoms/stateAtoms";
import { formatTime } from "@/app/type/ts/scene-ts/playing/formatTime";
import { ParseMap } from "@/lib/parseMap";
import { Text } from "@chakra-ui/react";

const VideoDurationTimeText = () => {
  const map = useMapState() as ParseMap | null;
  const speedData = usePlaySpeedState();
  const movieDuration = useYTStatusRef().readYTStatus().movieDuration;
  if (!map) {
    return;
  }
  const duration = map.movieTotalTime > movieDuration ? movieDuration : map?.movieTotalTime;
  const totalTime = formatTime(Number(duration) / speedData.playSpeed);

  return (
    <Text as="span" id="total_time">
      {totalTime}
    </Text>
  );
};

export default VideoDurationTimeText;
