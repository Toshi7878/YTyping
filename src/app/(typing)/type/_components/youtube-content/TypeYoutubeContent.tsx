"use client";
import { LoadingOverlayProvider } from "@/components/ui/loading-overlay";
import { useUserAgent } from "@/utils/useUserAgent";
import { useCallback, useEffect, useMemo } from "react";
import YouTube, { YouTubeEvent } from "react-youtube";
import { useWindowFocus } from "../../../../../utils/global-hooks/windowFocus";
import { useReadGameUtilParams } from "../../_lib/atoms/stateAtoms";
import { useTimerRegistration } from "../../_lib/hooks/playing-hooks/timer-hooks/timer";
import {
  useYTPauseEvent,
  useYTPlayEvent,
  useYTReadyEvent,
  useYTSeekEvent,
  useYTStopEvent,
} from "../../_lib/hooks/youtubeEvents";
import MobileCover from "./MobileCover";

interface YouTubeContentProps {
  isMapLoading: boolean;
  videoId: string;
  className?: string;
}

const YouTubeContent = ({ isMapLoading, videoId, className = "" }: YouTubeContentProps) => {
  const ytReadyEvent = useYTReadyEvent();
  const ytPlayEvent = useYTPlayEvent();
  const ytPauseEvent = useYTPauseEvent();
  const ytStopEvent = useYTStopEvent();
  const ytSeekEvent = useYTSeekEvent();
  const windowFocus = useWindowFocus();
  const { addTimer, removeTimer } = useTimerRegistration();
  const { isMobile } = useUserAgent();

  const readGameStateUtils = useReadGameUtilParams();

  useEffect(() => {
    addTimer();

    return () => {
      removeTimer();
    };
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

    [],
  );

  // YouTubeコンポーネントのエラーハンドリングを追加
  const handleError = useCallback((event: YouTubeEvent) => {
    console.error("YouTube Player Error:", event.data);
  }, []);

  const memoizedYouTube = useMemo(
    () => (
      <YouTube
        className={`${className} mt-2 aspect-video select-none`}
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

    [videoId],
  );

  return (
    <LoadingOverlayProvider isLoading={isMapLoading} message="譜面読み込み中...">
      {isMobile && <MobileCover />}
      {memoizedYouTube}
    </LoadingOverlayProvider>
  );
};

export default YouTubeContent;
