import { usePlaySpeedState } from "@/app/(typing)/type/_lib/atoms/speed-reducer";
import {
  useActiveSkipGuideKeyState,
  useBuiltMapState,
  useElapsedSecTimeState,
  useMovieDurationState,
  useSceneGroupState,
  useYTStartedState,
} from "@/app/(typing)/type/_lib/atoms/state";
import { cn } from "@/lib/utils";
import { formatTime } from "@/utils/format-time";

export const SkipAndTimeDisplay = () => {
  const isYTStarted = useYTStartedState();
  const sceneGroup = useSceneGroupState();
  const isPlayed = isYTStarted && sceneGroup === "Playing";
  return (
    <section
      className={cn(
        "bottom-card-text flex w-full items-center justify-between px-4 text-4xl font-bold md:text-xl",
        !isPlayed && "invisible",
      )}
    >
      <PlayingSkipGuide />
      <PlayingTimeDisplay />
    </section>
  );
};

const PlayingSkipGuide = () => {
  const activeSkipGuideKey = useActiveSkipGuideKeyState();
  return <div className="opacity-60">{activeSkipGuideKey ? `Type ${activeSkipGuideKey} key to Skip. ⏩` : ""}</div>;
};

const PlayingTimeDisplay = () => {
  return (
    <div className="font-mono" id="movie_time">
      <ElapsedMmSsDisplay /> / <VideoDurationTime />
    </div>
  );
};

const ElapsedMmSsDisplay = () => {
  const elapsedSecTime = useElapsedSecTimeState();
  return <span id="elapsed_sec_time">{formatTime(elapsedSecTime)}</span>;
};

const VideoDurationTime = () => {
  const map = useBuiltMapState();
  const speedData = usePlaySpeedState();
  const movieDuration = useMovieDurationState();
  if (!map) return;
  const duration = map.duration > movieDuration ? movieDuration : map?.duration;
  const totalTime = formatTime(Number(duration) / speedData.playSpeed);

  return <span id="constant_duration_count">{totalTime}</span>;
};
