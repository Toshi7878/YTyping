import { useYTStatusRef } from "@/app/type/atoms/refAtoms";
import { useMapAtom, usePlaySpeedAtom } from "@/app/type/atoms/stateAtoms";
import { formatTime } from "@/app/type/ts/scene-ts/playing/formatTime";
import { Text } from "@chakra-ui/react";

const VideoDurationTimeText = () => {
  const map = useMapAtom();
  const speedData = usePlaySpeedAtom();
  const { readYTStatusRef } = useYTStatusRef();
  const movieDuration = readYTStatusRef().movieDuration;
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
