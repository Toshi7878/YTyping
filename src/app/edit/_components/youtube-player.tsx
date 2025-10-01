"use client";

import { useCallback, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import type { YouTubeEvent } from "react-youtube";
import YouTube from "react-youtube";
import { LoadingOverlayProvider } from "@/components/ui/loading-overlay";
import { cn } from "@/lib/utils";
import { usePlayer } from "../_lib/atoms/read-atoms";
import {
  useIsYTReadiedState,
  useIsYTStartedState,
  useReadYtPlayerStatus,
  useVideoIdState,
} from "../_lib/atoms/state-atoms";
import { useUpdateEndTime } from "../_lib/map-table/use-update-end-time";
import { useOnEnd, useOnPause, useOnPlay, useOnReady, useOnSeeked } from "../_lib/youtube-player/use-youtube-event";

interface YouTubePlayerProps {
  className: string;
  videoId?: string;
}

export const YouTubePlayer = ({ className, videoId: mapVideoId }: YouTubePlayerProps) => {
  const videoId = useVideoIdState();
  const onReady = useOnReady();
  const onPlay = useOnPlay();
  const onPause = useOnPause();
  const onEnd = useOnEnd();
  const onSeek = useOnSeeked();

  const updateEndTime = useUpdateEndTime();
  const { readPlayer } = usePlayer();

  const isYTStarted = useIsYTStartedState();
  const isYTReady = useIsYTReadiedState();
  const readYtPlayerStatus = useReadYtPlayerStatus();

  useHotkeys(
    "Escape",
    () => {
      const isDialogOpen = document.querySelector('[role="dialog"]') !== null;
      if (isDialogOpen) return;

      const { playing } = readYtPlayerStatus();
      if (!playing) {
        readPlayer().playVideo();
      } else {
        readPlayer().pauseVideo();
      }
    },
    { enableOnFormTags: false, preventDefault: true },
  );

  useHotkeys(
    ["arrowleft", "arrowright"],
    (event) => {
      const isDialogOpen = document.querySelector('[role="dialog"]') !== null;
      if (isDialogOpen) return;

      const ARROW_SEEK_SECONDS = 3;

      const { speed } = readYtPlayerStatus();
      const time = readPlayer().getCurrentTime();
      const seekAmount = ARROW_SEEK_SECONDS * speed;
      if (event.key === "ArrowLeft") {
        readPlayer().seekTo(time - seekAmount, true);
      } else {
        readPlayer().seekTo(time + seekAmount, true);
      }
    },
    {
      enableOnFormTags: false,
      preventDefault: true,
      ignoreModifiers: true,
    },
  );

  useEffect(() => {
    if ((!isYTReady && !isYTStarted) || videoId === mapVideoId) return;
    updateEndTime(readPlayer());
  }, [isYTReady, isYTStarted, readPlayer, videoId, updateEndTime, mapVideoId]);

  const onStateChange = useCallback(
    (event: YouTubeEvent) => {
      if (document.activeElement instanceof HTMLIFrameElement) {
        document.activeElement.blur();
      }

      if (event.data === 3) {
        // seek時の処理
        onSeek(event);
      } else if (event.data === 1) {
        //	未スタート、他の動画に切り替えた時など
        console.log("未スタート -1");
      }
    },
    [onSeek],
  );

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
