import { ytStateRefAtom } from "@/app/type/atoms/refAtoms";
import { useMapAtom, useTypePageSpeedAtom } from "@/app/type/atoms/stateAtoms";
import { formatTime } from "@/app/type/ts/scene-ts/playing/formatTime";
import { Text } from "@chakra-ui/react";
import { useStore } from "jotai";

const VideoDurationTimeText = () => {
  const map = useMapAtom();
  const speedData = useTypePageSpeedAtom();
  const typeAtomStore = useStore();
  const movieDuration = typeAtomStore.get(ytStateRefAtom).movieDuration;
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
