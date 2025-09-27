import { useReadYTStatus } from "@/app/(typing)/type/_lib/atoms/ref-atoms";
import { usePlaySpeedState } from "@/app/(typing)/type/_lib/atoms/speed-reducer-atoms";
import {
  useCurrentTimeState,
  useMapState,
  useSceneGroupState,
  useSkipState,
  useYTStartedState,
} from "@/app/(typing)/type/_lib/atoms/state-atoms";
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
  const skip = useSkipState();

  return <div className="opacity-60">{skip ? `Type ${skip} key to Skip. ⏩` : ""}</div>;
};

const PlayingTimeDisplay = () => {
  return (
    <div className="font-mono" id="movie_time">
      <VideoCurrentTime /> / <VideoDurationTime />
    </div>
  );
};

const VideoCurrentTime = () => {
  const currentTimeSSMM = useCurrentTimeState();
  return <span id="current_time">{formatTime(currentTimeSSMM)}</span>;
};

const VideoDurationTime = () => {
  const map = useMapState();
  const speedData = usePlaySpeedState();
  const { movieDuration } = useReadYTStatus().readYTStatus();
  if (!map) {
    return;
  }
  const duration = map.duration > movieDuration ? movieDuration : map?.duration;
  const totalTime = formatTime(Number(duration) / speedData.playSpeed);

  return <span id="total_time">{totalTime}</span>;
};
