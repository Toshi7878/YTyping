"use client";

import { Box } from "@chakra-ui/react";
import { useCallback } from "react";
import YouTube from "react-youtube";
import { useVideoIdState } from "../../atoms/stateAtoms";
import {
  useYTEndStopEvent,
  useYTPauseEvent,
  useYTPlayEvent,
  useYTReadyEvent,
  useYTSeekEvent,
} from "../../hooks/useEditYouToubeEvents";

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

  const handleStateChange = useCallback(
    (event) => {
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
    []
  );

  return (
    <Box>
      <YouTube
        className={className}
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
        onEnd={onEndStop}
        onStateChange={handleStateChange}
      />
    </Box>
  );
};

export default EditYouTube;
