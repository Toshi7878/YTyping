import { useCurrentTimeState } from "@/app/(typing)/type/atoms/stateAtoms";
import { formatTime } from "@/utils/formatTime";

const VideoCurrentTimeText = () => {
  const currentTimeSSMM = useCurrentTimeState();

  return (
    <span id="current_time">
      {formatTime(currentTimeSSMM)}
    </span>
  );
};

export default VideoCurrentTimeText;
