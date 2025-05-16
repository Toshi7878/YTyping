"use client";
import { useCallback, useEffect, useMemo } from "react";
import YouTube, { YouTubeEvent } from "react-youtube";
import { useReadGameUtilParams } from "../../atom/stateAtoms";

import { useWindowFocus } from "@/util/global-hooks/windowFocus";
import { useTimerRegistration } from "../../hooks/timer";
import {
  useYTPauseEvent,
  useYTPlayEvent,
  useYTReadyEvent,
  useYTSeekEvent,
  useYTStopEvent,
} from "../../hooks/youtubeEvents";

interface ImeTypeYouTubeProps {
  videoId: string;
  className?: string;
  style: React.CSSProperties;
}

const ImeTypeYouTubeContent = ({ videoId, className = "", style }: ImeTypeYouTubeProps) => {
  const ytReadyEvent = useYTReadyEvent();
  const ytPlayEvent = useYTPlayEvent();
  const ytPauseEvent = useYTPauseEvent();
  const ytStopEvent = useYTStopEvent();
  const ytSeekEvent = useYTSeekEvent();
  const windowFocus = useWindowFocus();
  const { addTimer, removeTimer } = useTimerRegistration();

  const readGameStateUtils = useReadGameUtilParams();

  useEffect(() => {
    addTimer();

    return () => {
      removeTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStateChange = useCallback(
    (event: YouTubeEvent) => {
      if (document.activeElement instanceof HTMLIFrameElement && document.activeElement.tagName === "IFRAME") {
        windowFocus();
      }

      if (event.data === 3) {
        // seek時の処理
        ytSeekEvent();
      } else if (event.data === 1) {
        //	未スタート、他の動画に切り替えた時など
        console.log("未スタート -1");

        const { scene } = readGameStateUtils();
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
        className={`${className} select-none`}
        style={style}
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
        onEnd={ytStopEvent}
        onStateChange={handleStateChange}
        onError={handleError}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [videoId, className, style]
  );

  return memoizedYouTube;
};

export default ImeTypeYouTubeContent;
