"use client";

import { useCallback, useEffect, useMemo } from "react";
import type { YouTubeEvent } from "react-youtube";
import YouTube from "react-youtube";
import { LoadingOverlayProvider } from "@/components/ui/loading-overlay";
import { useIsMobileDeviceState } from "@/lib/atoms/user-agent";
import { cn } from "@/lib/utils";
import { windowFocus } from "@/utils/window-focus";
import { readYTPlayer } from "../_lib/atoms/ref";
import { readUtilityParams } from "../_lib/atoms/state";
import { iosActiveSound } from "../_lib/playing/sound-effect";
import { useTimerRegistration } from "../_lib/playing/timer/use-timer";
import {
  useOnEnd,
  useOnPause,
  useOnPlay,
  useOnRateChange,
  useOnReady,
  useOnSeeked,
} from "../_lib/youtube-player/use-youtube-events";

interface YouTubePlayerProps {
  isMapLoading: boolean;
  videoId: string;
  className?: string;
}

export const YouTubePlayer = ({ isMapLoading, videoId, className = "" }: YouTubePlayerProps) => {
  const onReady = useOnReady();
  const onPlay = useOnPlay();
  const onPause = useOnPause();
  const onEnd = useOnEnd();
  const onSeeked = useOnSeeked();
  const onRateChange = useOnRateChange();
  const { addTimer, removeTimer } = useTimerRegistration();
  const isMobile = useIsMobileDeviceState();

  useEffect(() => {
    addTimer();
    return () => removeTimer();
  }, []);

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
  const handleStart = () => {
    const { scene, isPaused } = readUtilityParams();

    iosActiveSound();

    const player = readYTPlayer();
    if (!player) return;
    if (isPaused || scene === "ready") {
      player.playVideo();
    } else {
      player.pauseVideo();
    }

    windowFocus();
  };

  return (
    <div
      id="mobile_cover"
      className="absolute inset-0 z-[5] cursor-pointer items-center rounded-lg transition-opacity duration-300"
      onClick={handleStart}
    />
  );
};
