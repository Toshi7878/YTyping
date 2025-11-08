"use client";

import { useMemo } from "react";
import YouTube from "react-youtube";
import { LoadingOverlayProvider } from "@/components/ui/loading-overlay";
import { useIsMobileDeviceState } from "@/lib/atoms/user-agent";
import { cn } from "@/lib/utils";
import { windowFocus } from "@/utils/window-focus";
import { readUtilityParams } from "../_lib/atoms/state";
import { pauseYTPlayer, playYTPlayer } from "../_lib/atoms/yt-player";
import { iosActiveSound } from "../_lib/playing/sound-effect";
import {
  onEnd,
  onPause,
  onPlay,
  onPlaybackRateChange,
  onReady,
  onStateChange,
} from "../_lib/youtube-player/youtube-events";

interface YouTubePlayerProps {
  isMapLoading: boolean;
  videoId: string;
  className?: string;
}

export const YouTubePlayer = ({ isMapLoading, videoId, className = "" }: YouTubePlayerProps) => {
  const isMobile = useIsMobileDeviceState();

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
        onReady={onReady}
        onPlay={onPlay}
        onPause={onPause}
        onEnd={onEnd}
        onStateChange={onStateChange}
        onPlaybackRateChange={onPlaybackRateChange}
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
    if (isPaused || scene === "ready") {
      playYTPlayer();
    } else {
      pauseYTPlayer();
    }

    windowFocus();
  };

  return (
    <div
      id="mobile_cover"
      className="absolute inset-0 z-5 cursor-pointer items-center rounded-lg transition-opacity duration-300"
      onClick={handleStart}
    />
  );
};
