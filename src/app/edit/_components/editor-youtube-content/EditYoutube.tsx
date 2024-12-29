"use client";

import { Ticker } from "@pixi/ticker";
import { useCallback, useEffect } from "react";
import YouTube from "react-youtube";
import { useVideoIdAtom } from "../../edit-atom/editAtom";
import { useEditTimer } from "../../hooks/timer/useEditTimer";
import {
  useYTEndStopEvent,
  useYTPauseEvent,
  useYTPlayEvent,
  useYTReadyEvent,
  useYTSeekEvent,
} from "../../hooks/useEditYTEventsHooks";

interface EditorYouTubeProps {
  className: string;
}
export const editTicker = new Ticker();

const EditYouTube = function ({ className }: EditorYouTubeProps) {
  const videoId = useVideoIdAtom();
  const onReady = useYTReadyEvent();
  const { onPlay } = useYTPlayEvent();
  const onPause = useYTPauseEvent();
  const onEndStop = useYTEndStopEvent();
  const onSeek = useYTSeekEvent();
  const editTimer = useEditTimer();

  const handleStateChange = useCallback(
    (event: any) => {
      if (
        document.activeElement instanceof HTMLIFrameElement &&
        document.activeElement.tagName === "IFRAME"
      ) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    editTicker.add(editTimer);
    return () => {
      editTicker.stop();
      editTicker.remove(editTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <YouTube
      className={className}
      videoId={videoId}
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
  );
};

export default EditYouTube;
