"use client";
import type { CSSProperties } from "react";
import YouTube from "react-youtube";
import { getVolume } from "@/store/volume";
import { readScene } from "../_lib/atoms/state";
import { seekYTPlayer, setYTPlayer, stopYTPlayer } from "../_lib/atoms/yt-player";
import { initializePlayScene } from "../_lib/core/reset";
import { pauseTimer, startTimer } from "../_lib/core/timer";

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

const onStart = async () => {
  initializePlayScene();
};

const onPlay = async () => {
  console.log("再生 1");
  const scene = readScene();
  if (scene === "ready") {
    onStart();
  }

  if (scene === "play") {
    startTimer();
  }
};

const onEnd = () => {
  console.log("プレイ終了");

  seekYTPlayer(0);
  stopYTPlayer();
  pauseTimer();
};

const onPause = () => {
  console.log("一時停止");
  pauseTimer();
};

const onReady = (event: { target: YT.Player }) => {
  const player = event.target as YT.Player;
  player.setVolume(getVolume());
  setYTPlayer(player);
};
