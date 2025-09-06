"use client";

import { LoadingOverlayProvider } from "@/components/ui/loading-overlay";
import { cn } from "@/lib/utils";
import { useCallback, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import YouTube from "react-youtube";
import { usePlayer } from "../_lib/atoms/refAtoms";
import {
  useIsYTReadiedState,
  useIsYTStartedState,
  useReadYtPlayerStatus,
  useVideoIdState,
} from "../_lib/atoms/stateAtoms";
import {
  useYTEndStopEvent,
  useYTPauseEvent,
  useYTPlayEvent,
  useYTReadyEvent,
  useYTSeekEvent,
} from "../_lib/hooks/useEditYouToubeEvents";
import { useUpdateEndTime } from "../_lib/hooks/useUpdateEndTime";

interface EditorYouTubeProps {
  className: string;
}

const EditYouTube = function ({ className }: EditorYouTubeProps) {
  const videoId = useVideoIdState();
  const onReady = useYTReadyEvent();
  const onPlay = useYTPlayEvent();
  const onPause = useYTPauseEvent();
  const onEndStop = useYTEndStopEvent();
  const onSeek = useYTSeekEvent();

  const updateEndTime = useUpdateEndTime();
  const { readPlayer } = usePlayer();

  const isYTStarted = useIsYTStartedState();
  const isYTReady = useIsYTReadiedState();
  const readYtPlayerStatus = useReadYtPlayerStatus();

  useHotkeys(
    "Escape",
    () => {
      const { playing } = readYtPlayerStatus();
      if (!playing) {
        readPlayer().playVideo();
      } else {
        readPlayer().pauseVideo();
      }
    },
    {
      enableOnFormTags: false,
      preventDefault: true,
    },
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
    },
  );

  useEffect(() => {
    if (!isYTReady && !isYTStarted) return;
    updateEndTime(readPlayer());
  }, [isYTReady, isYTStarted, readPlayer]);

  const handleStateChange = useCallback(
    (event) => {
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

    [],
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
          onEnd={onEndStop}
          onStateChange={handleStateChange}
        />
      </LoadingOverlayProvider>
    </div>
  );
};

export default EditYouTube;
