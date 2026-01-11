import { useEffect, useRef } from "react";
import {
  useActiveSkipGuideKeyState,
  useBuiltMapState,
  useMediaSpeedState,
  useMovieDurationState,
  useSceneGroupState,
  useYTStartedState,
} from "@/app/(typing)/type/_lib/atoms/state";
import { cn } from "@/lib/utils";
import { formatTime } from "@/utils/format-time";
import { setElapsedSecTimeElement } from "../../../_lib/atoms/sub-status";

export const SkipAndTimeDisplay = () => {
  const isYTStarted = useYTStartedState();
  const sceneGroup = useSceneGroupState();
  const isPlayed = isYTStarted && sceneGroup === "Playing";
  return (
    <section
      className={cn(
        "bottom-card-text flex w-full items-center justify-between px-4 font-bold text-4xl md:text-xl",
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
  const elapsedSecTimeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (elapsedSecTimeRef.current) {
      setElapsedSecTimeElement(elapsedSecTimeRef.current);
    }
  }, []);

  return (
    <span id="elapsed_sec_time" ref={elapsedSecTimeRef}>
      00:00
    </span>
  );
};

const VideoDurationTime = () => {
  const map = useBuiltMapState();
  const playSpeed = useMediaSpeedState();
  const movieDuration = useMovieDurationState();
  if (!map) return;
  const duration = map.duration > movieDuration ? movieDuration : map?.duration;
  const totalTime = formatTime(Number(duration) / playSpeed);

  return <span id="constant_duration_count">{totalTime}</span>;
};
