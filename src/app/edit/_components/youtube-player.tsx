"use client";

import { useHotkeys } from "react-hotkeys-hook";
import YouTube from "react-youtube";
import { LoadingOverlayProvider } from "@/components/ui/loading-overlay";
import { cn } from "@/lib/utils";
import { isDialogOpen } from "@/utils/is-dialog-option";
import { useVideoIdState } from "../_lib/atoms/hydrate";
import { readYTPlayerStatus } from "../_lib/atoms/state";
import { pauseYTPlayer, playYTPlayer } from "../_lib/atoms/youtube-player";
import {
  onEnd,
  onPause,
  onPlay,
  onPlaybackRateChange,
  onReady,
  onStateChange,
} from "../_lib/youtube-player/youtube-event";

export const YouTubePlayer = ({ className }: { className: string }) => {
  const videoId = useVideoIdState();

  useHotkeys(
    "Escape",
    () => {
      if (isDialogOpen()) return;
      const { isPlaying } = readYTPlayerStatus();
      if (!isPlaying) {
        playYTPlayer();
      } else {
        pauseYTPlayer();
      }
    },
    { enableOnFormTags: ["slider"], preventDefault: true },
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
          onPlaybackRateChange={onPlaybackRateChange}
        />
      </LoadingOverlayProvider>
    </div>
  );
};
