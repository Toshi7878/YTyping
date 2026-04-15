import { useStore } from "jotai";
import { uncontrolled } from "jotai-uncontrolled";
import { useBuiltMapState, useMediaSpeedState } from "@/app/(typing)/type/_feature/atoms/state";
import { formatTime } from "@/utils/format-time";
import { elapsedSecFormatTimeAtom } from "../../atoms/substatus";

export const PlaybackTimeDisplay = () => {
  return (
    <div className="font-mono" id="movie_time">
      <ElapsedTimeDisplay /> / <DurationDisplay />
    </div>
  );
};

const ElapsedTimeDisplay = () => {
  const store = useStore();

  return (
    <uncontrolled.span id="elapsed_sec_time" atomStore={store}>
      {elapsedSecFormatTimeAtom}
    </uncontrolled.span>
  );
};

const DurationDisplay = () => {
  const map = useBuiltMapState();
  const playSpeed = useMediaSpeedState();
  if (!map) return;
  const totalTime = formatTime(map.duration / playSpeed);

  return <span id="constant_duration_count">{totalTime}</span>;
};
