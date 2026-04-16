import { atom } from "jotai";
import { uncontrolled } from "jotai-uncontrolled";
import { useBuiltMapState } from "@/app/(typing)/type/_feature/atoms/built-map";
import { formatTime } from "@/utils/format-time";
import { getTypingGameAtomStore } from "../../atoms/store";
import { useMediaSpeedState } from "../../youtube/youtube-player";

export const PlaybackTimeDisplay = () => {
  return (
    <div className="font-mono" id="movie_time">
      <ElapsedTimeDisplay /> / <DurationDisplay />
    </div>
  );
};

const store = getTypingGameAtomStore();

const elapsedSecTimeAtom = atom(0);

export const elapsedSecFormatTimeAtom = atom((get) => {
  const elapsedSecTime = get(elapsedSecTimeAtom);
  return formatTime(elapsedSecTime);
});

export const getElapsedSecTime = () => store.get(elapsedSecTimeAtom);
export const setElapsedSecTime = (value: number) => store.set(elapsedSecTimeAtom, value);

const ElapsedTimeDisplay = () => {
  return (
    <uncontrolled.span id="media_elapsed_time" atomStore={store}>
      {elapsedSecFormatTimeAtom}
    </uncontrolled.span>
  );
};

const DurationDisplay = () => {
  const map = useBuiltMapState();
  const playSpeed = useMediaSpeedState();
  if (!map) return;
  const totalTime = formatTime(map.duration / playSpeed);

  return <span id="media_duration_time">{totalTime}</span>;
};
