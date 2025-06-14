import { useYTStatus } from "@/app/(typing)/type/atoms/refAtoms";
import { usePlaySpeedState } from "@/app/(typing)/type/atoms/speedReducerAtoms";
import { useMapState } from "@/app/(typing)/type/atoms/stateAtoms";
import { formatTime } from "@/utils/formatTime";

const VideoDurationTimeText = () => {
  const map = useMapState();
  const speedData = usePlaySpeedState();
  const movieDuration = useYTStatus().readYTStatus().movieDuration;
  if (!map) {
    return;
  }
  const duration = map.movieTotalTime > movieDuration ? movieDuration : map?.movieTotalTime;
  const totalTime = formatTime(Number(duration) / speedData.playSpeed);

  return (
    <span id="total_time">
      {totalTime}
    </span>
  );
};

export default VideoDurationTimeText;
