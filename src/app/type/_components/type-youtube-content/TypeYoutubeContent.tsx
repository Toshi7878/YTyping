"use client";
import { Box } from "@chakra-ui/react";
import { useStore } from "jotai";
import { useCallback, useMemo } from "react";
import LoadingOverlayWrapper from "react-loading-overlay-ts";
import YouTube, { YouTubeEvent } from "react-youtube";
import {
  useYTEndEvent,
  useYTPauseEvent,
  useYTPlayEvent,
  useYTReadyEvent,
  useYTSeekEvent,
  useYTStopEvent,
} from "../../hooks/useYoutubeEvents";
import { sceneAtom } from "../../type-atoms/gameRenderAtoms";

interface TypeYouTubeProps {
  isMapLoading: boolean;
  className: string;
  videoId: string;
}

const TypeYouTubeContent = function YouTubeContent({
  isMapLoading,
  className,
  videoId,
}: TypeYouTubeProps) {
  const typeAtomStore = useStore();

  const ytReadyEvent = useYTReadyEvent();
  const ytPlayEvent = useYTPlayEvent();
  const ytPauseEvent = useYTPauseEvent();
  const ytStopEvent = useYTStopEvent();
  const ytEndEvent = useYTEndEvent();
  const ytSeekEvent = useYTSeekEvent();

  const handleStateChange = useCallback(
    (event: YouTubeEvent) => {
      if (
        document.activeElement instanceof HTMLIFrameElement &&
        document.activeElement.tagName === "IFRAME"
      ) {
        document.activeElement.blur();
      }

      if (event.data === 3) {
        // seek時の処理
        ytSeekEvent();
      } else if (event.data === 1) {
        //	未スタート、他の動画に切り替えた時など
        console.log("未スタート -1");

        const scene = typeAtomStore.get(sceneAtom);
        if (scene === "ready") {
          event.target.seekTo(0, true);
        }
      } else if (event.data === 5) {
        console.log("動画強制停止");
        ytStopEvent();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // YouTubeコンポーネントのエラーハンドリングを追加
  const handleError = useCallback((event: YouTubeEvent) => {
    console.error("YouTube Player Error:", event.data);
  }, []);

  const memoizedYouTube = useMemo(
    () => (
      <YouTube
        className={`${className} `}
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
          },
        }}
        onReady={ytReadyEvent}
        onPlay={ytPlayEvent}
        onPause={ytPauseEvent}
        onEnd={ytEndEvent}
        onStateChange={handleStateChange}
        onError={handleError} // エラーハンドリングを追加
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [className, videoId]
  );

  return (
    <Box style={{ userSelect: "none" }}>
      <LoadingOverlayWrapper active={isMapLoading} spinner={true} text="譜面読み込み中...">
        {memoizedYouTube}
      </LoadingOverlayWrapper>
    </Box>
  );
};

export default TypeYouTubeContent;