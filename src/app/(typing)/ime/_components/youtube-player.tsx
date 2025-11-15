"use client";
import type { CSSProperties } from "react";
import YouTube from "react-youtube";
import { onEnd, onPause, onPlay, onReady } from "../_lib/core/youtube-events";

interface YouTubePlayerProps {
  videoId: string;
  className?: string;
  style: CSSProperties;
}

export const YouTubePlayer = ({ videoId, className = "", style }: YouTubePlayerProps) => {
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
    />
  );
};
