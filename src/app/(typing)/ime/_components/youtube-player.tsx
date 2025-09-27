"use client";
import type { CSSProperties } from "react";
import { useCallback, useEffect } from "react";
import type { YouTubeEvent } from "react-youtube";
import YouTube from "react-youtube";
import { useReadScene } from "../_lib/atoms/state-atoms";
import { useTimerRegistration } from "../_lib/hooks/timer";
import { useOnEnd, useOnPause, useOnPlay, useOnReady, useOnSeek, useOnStop } from "../_lib/hooks/youtube-events";

interface YouTubePlayerProps {
  videoId: string;
  className?: string;
  style: CSSProperties;
}

export const YouTubePlayer = ({ videoId, className = "", style }: YouTubePlayerProps) => {
  const onReady = useOnReady();
  const onPlay = useOnPlay();
  const onPause = useOnPause();
  const onStop = useOnStop();
  const onEnd = useOnEnd();
  const onSeek = useOnSeek();
  const { addTimer, removeTimer } = useTimerRegistration();
  const readScene = useReadScene();

  useEffect(() => {
    addTimer();
    return () => removeTimer();
  }, []);

  const handleStateChange = (event: YouTubeEvent) => {
    switch (event.data) {
      case 3:
        // seek時の処理
        onSeek();
        break;
      case 1: {
        //	未スタート、他の動画に切り替えた時など
        console.log("未スタート -1");

        const scene = readScene();
        if (scene === "ready") {
          event.target.seekTo(0, true);
        }
        break;
      }
      case 5: {
        // 動画強制停止
        console.log("動画強制停止");
        onStop();
        break;
      }
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
      onReady={onReady}
      onPlay={onPlay}
      onPause={onPause}
      onEnd={onEnd}
      onStateChange={handleStateChange}
      onError={handleError}
    />
  );
};
