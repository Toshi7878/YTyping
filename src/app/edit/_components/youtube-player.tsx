"use client";

import { useHotkeys } from "react-hotkeys-hook";
import YouTube from "react-youtube";
import { LoadingOverlayProvider } from "@/components/ui/loading-overlay";
import { cn } from "@/lib/utils";
import { useVideoIdState } from "../_lib/atoms/hydrate";
import { readYTPlayer, readYTPlayerStatus } from "../_lib/atoms/state";
import { onEnd, onPause, onPlay, onReady, onStateChange } from "../_lib/youtube-player/youtube-event";

export const YouTubePlayer = ({ className }: { className: string }) => {
  const videoId = useVideoIdState();

  useHotkeys(
    "Escape",
    () => {
      const isDialogOpen = document.querySelector('[role="dialog"]') !== null;
      const YTPlayer = readYTPlayer();
      if (isDialogOpen || !YTPlayer) return;

      const { isPlaying: playing } = readYTPlayerStatus();
      if (!playing) {
        YTPlayer.playVideo();
      } else {
        YTPlayer.pauseVideo();
      }
    },
    { enableOnFormTags: false, preventDefault: true },
  );

  return (
    <div className="relative h-fit">
      <LoadingOverlayProvider isLoading={!videoId} message="動画読込中..." asChild>
        <YouTube
          className={cn(className, !videoId && "invisible")}
          id="edit_youtube"
          videoId={videoId}
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
