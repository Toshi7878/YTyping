"use client";

import { useCallback, useEffect, useMemo } from "react";
import type { YouTubeEvent } from "react-youtube";
import YouTube from "react-youtube";
import { LoadingOverlayProvider } from "@/components/ui/loading-overlay";
import { useUserAgent } from "@/lib/global-atoms";
import { cn } from "@/lib/utils";
import { windowFocus } from "@/utils/hooks/window-focus";
import { usePlayer, useReadYTStatus } from "../_lib/atoms/ref-atoms";
import { useReadGameUtilParams } from "../_lib/atoms/state-atoms";
import { useTimerRegistration } from "../_lib/hooks/playing/timer/timer";
import {
  useOnEnd,
  useOnPause,
  useOnPlay,
  useOnRateChange,
  useOnReady,
  useOnSeeked,
} from "../_lib/hooks/youtube-events";

interface YouTubePlayerProps {
  isMapLoading: boolean;
  videoId: string;
  className?: string;
}

const YouTubePlayer = ({ isMapLoading, videoId, className = "" }: YouTubePlayerProps) => {
  const onReady = useOnReady();
  const onPlay = useOnPlay();
  const onPause = useOnPause();
  const onEnd = useOnEnd();
  const onSeeked = useOnSeeked();
  const onRateChange = useOnRateChange();
  const { addTimer, removeTimer } = useTimerRegistration();
  const isMobile = useUserAgent()?.getDevice().type === "mobile";
  useEffect(() => {
    addTimer();
    return () => removeTimer();
  }, []);

  // const memorizedYouTubePlayer = useMemo(() => {
  //   return (
  //     <ReactPlayer
  //       className={cn("mt-2 select-none", className)}
  //       width={width}
  //       height={height}
  //       id="yt_player"
  //       src={`https://www.youtube.com/watch?v=${videoId}`}
  //       controls={false}
  //       playsInline={true}
  //       config={{
  //         youtube: {
  //           enablejsapi: 1,
  //           rel: 0,
  //           fs: 0,
  //         },
  //       }}
  //       onLoadedMetadata={({ target }) => onReady((target as unknown as { api: YT.Player }).api)}
  //       // onStart / onPlay / onPlaying
  //       onStart={({ target }) => onStart((target as unknown as { api: YT.Player }).api)}
  //       onPlaying={() => onPlay()}
  //       onPause={() => onPause()}
  //       onEnded={({ target }) => onEnd((target as unknown as { api: YT.Player }).api)}
  //       onSeeked={({ target }) => onSeeked((target as unknown as { api: YT.Player }).api)}
  //       onRateChange={({ target }) => onRateChange((target as unknown as { api: YT.Player }).api)}
  //     />
  //   );
  // }, [videoId, className, width, height]);

  const onStateChange = useCallback(
    (event: YouTubeEvent) => {
      if (event.data === YT.PlayerState.BUFFERING) {
        onSeeked(event.target as YT.Player);
      }
    },

    [],
  );

  const memoizedYouTube = useMemo(
    () => (
      <YouTube
        className={cn("mt-2 aspect-video select-none", className)}
        id="yt_player"
        videoId={videoId}
        opts={{
          width: "100%",
          height: "100%",
          playerVars: {
            enablejsapi: 1,
            controls: 0,
            playsinline: 1,
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0,
            fs: 0,
          },
        }}
        onReady={({ target }) => onReady(target as YT.Player)}
        onPlay={({ target }) => onPlay(target as YT.Player)}
        onPause={() => onPause()}
        onEnd={onEnd}
        onStateChange={onStateChange}
        onPlaybackRateChange={({ target }) => onRateChange(target as YT.Player)}
      />
    ),

    [videoId],
  );

  return (
    <LoadingOverlayProvider isLoading={isMapLoading} message="譜面読み込み中...">
      {isMobile && <MobileCover />}
      {memoizedYouTube}
    </LoadingOverlayProvider>
  );
};

const MobileCover = () => {
  const { readPlayer } = usePlayer();
  const { readYTStatus } = useReadYTStatus();

  const readGameStateUtils = useReadGameUtilParams();
  const handleStart = useCallback(async () => {
    const { scene } = readGameStateUtils();

    if (readYTStatus().isPaused || scene === "ready") {
      readPlayer().playVideo();
    } else {
      readPlayer().pauseVideo();
    }

    windowFocus();
  }, [readGameStateUtils, readPlayer, readYTStatus]);

  return (
    <div
      id="mobile_cover"
      className="absolute inset-0 z-[5] cursor-pointer items-center rounded-lg transition-opacity duration-300"
      onClick={handleStart}
    />
  );
};

export default YouTubePlayer;
