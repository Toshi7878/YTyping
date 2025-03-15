"use client";
import { useCallback, useMemo } from "react";
import LoadingOverlayWrapper from "react-loading-overlay-ts";
import YouTube, { YouTubeEvent } from "react-youtube";
import { useSceneStateRef } from "../../atoms/stateAtoms";
import { useWindowFocus } from "../../hooks/useWindowFocus";
import {
  useYTEndEvent,
  useYTPauseEvent,
  useYTPlayEvent,
  useYTReadyEvent,
  useYTSeekEvent,
  useYTStopEvent,
} from "../../hooks/useYoutubeEvents";

interface TypeYouTubeProps {
  isMapLoading: boolean;
  videoId: string;
  className?: string;
}

const TypeYouTubeContent = function YouTubeContent({
  isMapLoading,
  videoId,
  className = "",
}: TypeYouTubeProps) {
  const readScene = useSceneStateRef();

  const ytReadyEvent = useYTReadyEvent();
  const ytPlayEvent = useYTPlayEvent();
  const ytPauseEvent = useYTPauseEvent();
  const ytStopEvent = useYTStopEvent();
  const ytEndEvent = useYTEndEvent();
  const ytSeekEvent = useYTSeekEvent();
  const windowFocus = useWindowFocus();
  const handleStateChange = useCallback(
    (event: YouTubeEvent) => {
      if (
        document.activeElement instanceof HTMLIFrameElement &&
        document.activeElement.tagName === "IFRAME"
      ) {
        windowFocus();
      }

      if (event.data === 3) {
        // seek時の処理
        ytSeekEvent();
      } else if (event.data === 1) {
        //	未スタート、他の動画に切り替えた時など
        console.log("未スタート -1");

        const scene = readScene();
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
        className={`${className} aspect-video mt-2 select-none`}
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
        onReady={ytReadyEvent}
        onPlay={ytPlayEvent}
        onPause={ytPauseEvent}
        onEnd={ytEndEvent}
        onStateChange={handleStateChange}
        onError={handleError} // エラーハンドリングを追加
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [videoId]
  );

  return (
    <LoadingOverlayWrapper active={isMapLoading} spinner={true} text="譜面読み込み中...">
      {memoizedYouTube}
    </LoadingOverlayWrapper>
  );
};

export default TypeYouTubeContent;
