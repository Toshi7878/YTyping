"use client";
import type { CSSProperties } from "react";
import { useCallback, useEffect } from "react";
import type { YouTubeEvent } from "react-youtube";
import YouTube from "react-youtube";
import { useReadScene } from "../_lib/atoms/stateAtoms";

import { useWindowFocus } from "@/utils/hooks/windowFocus";
import { useTimerRegistration } from "../_lib/hooks/timer";
import {
  useYTEndEvent,
  useYTPauseEvent,
  useYTPlayEvent,
  useYTReadyEvent,
  useYTSeekEvent,
  useYTStopEvent,
} from "../_lib/hooks/youtubeEvents";

interface YouTubePlayerProps {
  videoId: string;
  className?: string;
  style: CSSProperties;
}

const YouTubePlayer = ({ videoId, className = "", style }: YouTubePlayerProps) => {
  const ytReadyEvent = useYTReadyEvent();
  const ytPlayEvent = useYTPlayEvent();
  const ytPauseEvent = useYTPauseEvent();
  const ytStopEvent = useYTStopEvent();
  const ytEndEvent = useYTEndEvent();
  const ytSeekEvent = useYTSeekEvent();
  const windowFocus = useWindowFocus();
  const { addTimer, removeTimer } = useTimerRegistration();
  const readScene = useReadScene();

  useEffect(() => {
    addTimer();

    return () => {
      removeTimer();
    };
  }, [addTimer, removeTimer]);

  const handleStateChange = (event: YouTubeEvent) => {
    if (document.activeElement instanceof HTMLIFrameElement && document.activeElement.tagName === "IFRAME") {
      windowFocus();
    }

    switch (event.data) {
      case 3:
        // seek時の処理
        ytSeekEvent();
        break;
      case 1:
        //	未スタート、他の動画に切り替えた時など
        console.log("未スタート -1");

        const scene = readScene();
        if (scene === "ready") {
          event.target.seekTo(0, true);
        }
        break;
      case 5:
        // 動画強制停止
        console.log("動画強制停止");
        ytStopEvent();
        break;
    }
  };

  // YouTubeコンポーネントのエラーハンドリングを追加
  const handleError = useCallback((event: YouTubeEvent) => {
    console.error("YouTube Player Error:", event.data);
  }, []);

  return (
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
      onEnd={ytEndEvent}
      onStateChange={handleStateChange}
      onError={handleError}
    />
  );
};

export default YouTubePlayer;
