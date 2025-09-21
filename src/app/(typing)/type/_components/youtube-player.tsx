"use client";
import { LoadingOverlayProvider } from "@/components/ui/loading-overlay";
import { useUserAgent } from "@/lib/globalAtoms";
import { useCallback, useEffect, useMemo } from "react";
import type { YouTubeEvent } from "react-youtube";
import YouTube from "react-youtube";
import { useWindowFocus } from "../../../../utils/hooks/windowFocus";
import { usePlayer, useReadYTStatus } from "../_lib/atoms/refAtoms";
import { useReadGameUtilParams } from "../_lib/atoms/stateAtoms";
import { useTimerRegistration } from "../_lib/hooks/playing/timer/timer";
import {
  useYTPauseEvent,
  useYTPlayEvent,
  useYTReadyEvent,
  useYTSeekEvent,
  useYTStopEvent,
} from "../_lib/hooks/youtubeEvents";

interface YouTubePlayerProps {
  isMapLoading: boolean;
  videoId: string;
  className?: string;
}

const YouTubePlayer = ({ isMapLoading, videoId, className = "" }: YouTubePlayerProps) => {
  const ytReadyEvent = useYTReadyEvent();
  const ytPlayEvent = useYTPlayEvent();
  const ytPauseEvent = useYTPauseEvent();
  const ytStopEvent = useYTStopEvent();
  const ytSeekEvent = useYTSeekEvent();
  const windowFocus = useWindowFocus();
  const { addTimer, removeTimer } = useTimerRegistration();
  const isMobile = useUserAgent()?.getDevice().type === "mobile";

  const readGameStateUtils = useReadGameUtilParams();

  useEffect(() => {
    addTimer();
    return () => removeTimer();
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

const MobileCover = () => {
  const windowFocus = useWindowFocus();
  const { readPlayer } = usePlayer();
  const { readYTStatus } = useReadYTStatus();

  const readGameStateUtils = useReadGameUtilParams();
  const handleStart = useCallback(async () => {
    const { scene } = readGameStateUtils();

    if (readYTStatus().isPaused || scene === "ready") {
      readPlayer().playVideo();
    } else {
      readPlayer().pauseVideo();
    }

    windowFocus();
  }, []);

  return (
    <div
      id="mobile_cover"
      className="absolute inset-0 z-[5] cursor-pointer items-center rounded-lg transition-opacity duration-300"
      onClick={handleStart}
    />
  );
};

export default YouTubePlayer;
