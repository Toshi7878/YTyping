"use client";

import { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import YouTube from "react-youtube";
import { LoadingOverlayProvider } from "@/components/ui/loading-overlay";
import { cn } from "@/lib/utils";
import { readYTPlayer } from "../_lib/atoms/ref";
import { readYTPlayerStatus, useIsYTReadiedState, useIsYTStartedState, useVideoIdState } from "../_lib/atoms/state";
import { updateEndTime } from "../_lib/map-table/update-end-time";
import { onEnd, onPause, onPlay, onReady, onStateChange } from "../_lib/youtube-player/youtube-event";

interface YouTubePlayerProps {
  className: string;
  videoId?: string;
}

export const YouTubePlayer = ({ className, videoId: mapVideoId }: YouTubePlayerProps) => {
  const videoId = useVideoIdState();
  const isYTStarted = useIsYTStartedState();
  const isYTReady = useIsYTReadiedState();

  useHotkeys(
    "Escape",
    () => {
      const isDialogOpen = document.querySelector('[role="dialog"]') !== null;
      const YTPlayer = readYTPlayer();
      if (isDialogOpen || !YTPlayer) return;

      const { playing } = readYTPlayerStatus();
      if (!playing) {
        YTPlayer.playVideo();
      } else {
        YTPlayer.pauseVideo();
      }
    },
    { enableOnFormTags: false, preventDefault: true },
  );

  useEffect(() => {
    const YTPlayer = readYTPlayer();
    if (!YTPlayer || (!isYTReady && !isYTStarted) || videoId === mapVideoId) return;
    updateEndTime(YTPlayer);
  }, [isYTReady, isYTStarted, videoId, mapVideoId]);

  return (
    <div className="relative h-fit">
      <LoadingOverlayProvider isLoading={!videoId} message="動画読込中..." asChild>
        <YouTube
          className={cn(className, !videoId && "invisible")}
          id="edit_youtube"
          videoId={videoId ?? ""}
          opts={{
            width: "100%",
            height: "100%",
            playerVars: { enablejsapi: 1 },
          }}
          onReady={onReady}
          onPlay={onPlay}
          onPause={onPause}
          onEnd={onEnd}
          onStateChange={onStateChange}
        />
      </LoadingOverlayProvider>
    </div>
  );
};
