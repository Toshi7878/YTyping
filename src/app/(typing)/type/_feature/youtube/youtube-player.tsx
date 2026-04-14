"use client";

import YouTube, { type YouTubeEvent } from "react-youtube";
import { LoadingOverlayProvider } from "@/components/ui/overlay";
import { readReadyInputMode, readVolume } from "@/lib/atoms/global-atoms";
import { useIsMobileDeviceState } from "@/lib/atoms/user-agent";
import { mutatePlayCountStats } from "@/lib/mutations/play-count";
import { cn } from "@/lib/utils";
import { getBaseUrl } from "@/utils/get-base-url";
import { windowFocus } from "@/utils/window-focus";
import { readMapId } from "../../_atoms/hydrate";
import { writeLineCount } from "../../_atoms/ref";
import {
  getBuiltMap,
  readMinMediaSpeed,
  readSceneGroup,
  readUtilityParams,
  setIsPaused,
  setLastLineEndTime,
  setMediaSpeed,
  setNotify,
  setPlayingInputMode,
  setScene,
  setTabName,
  setYTStarted,
} from "../../_atoms/state";
import { pauseYTPlayer, playYTPlayer, writeYTPlayer } from "../../_atoms/youtube-player";
import { iosActiveSound } from "../../_lib/sound-effect";
import { startTimer, stopTimer } from "../typing-card/playing/timer/timer";

interface YouTubePlayerProps {
  isMapLoading: boolean;
  videoId: string;
  className?: string;
}

export const YouTubePlayer = ({ isMapLoading, videoId, className = "" }: YouTubePlayerProps) => {
  const isMobile = useIsMobileDeviceState();

  return (
    <LoadingOverlayProvider isLoading={isMapLoading} description="譜面読み込み中...">
      {isMobile && <MobileCover />}
      <YouTube
        className={cn("mt-2 aspect-video select-none", className)}
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
            origin: `${getBaseUrl()}/type`,
          },
        }}
        onReady={handleReady}
        onPlay={handlePlay}
        onPause={handlePause}
        onStateChange={handleStateChange}
        onPlaybackRateChange={handlePlaybackRateChange}
      />
    </LoadingOverlayProvider>
  );
};

const MobileCover = () => {
  const handleTouchStart = () => {
    const { scene, isPaused } = readUtilityParams();
    iosActiveSound();
    if (isPaused || scene === "ready") {
      playYTPlayer();
    } else {
      pauseYTPlayer();
    }

    windowFocus();
  };

  return (
    <div
      id="mobile_cover"
      className="absolute inset-0 z-5 cursor-pointer items-center rounded-lg transition-opacity duration-300"
      onClick={handleTouchStart}
    />
  );
};

const handleStart = (player: YT.Player) => {
  const { scene } = readUtilityParams();
  const map = getBuiltMap();
  if (!map) return;
  setLastLineEndTime(map, player.getDuration());
  const mapId = readMapId();
  if (mapId) {
    mutatePlayCountStats({ mapId });
  }
  setTabName("ステータス");
  setYTStarted(true);
  player.seekTo(0, true);
  if (scene === "replay") return;

  const minMediaSpeed = readMinMediaSpeed();
  if (minMediaSpeed < 1) {
    setScene("practice");
  } else if (scene === "ready") {
    setScene("play");
  }

  const readyInputMode = readReadyInputMode();
  setPlayingInputMode(readyInputMode);
};

const handlePlay = async ({ target: player }: { target: YT.Player }) => {
  windowFocus();

  console.log("再生 1");

  const { scene, isYTStarted, isPaused } = readUtilityParams();
  const sceneGroup = readSceneGroup();

  if (sceneGroup === "Ready" || sceneGroup === "Playing") {
    startTimer();
  }

  if (!isYTStarted) {
    handleStart(player);
  }

  if (isPaused) {
    setIsPaused(false);

    if (scene !== "practice") {
      setNotify(Symbol("▶"));
    }
  }
};

const handlePause = () => {
  console.log("一時停止");

  stopTimer();

  const { isPaused, scene } = readUtilityParams();
  if (!isPaused) {
    setIsPaused(true);
    if (scene === "practice") return;
    setNotify(Symbol("ll"));
  }
};

const handleSeeked = (player: YT.Player) => {
  const time = player.getCurrentTime();

  if (time === 0) {
    writeLineCount(0);
  }

  console.log("シーク");
};

const handleReady = ({ target: player }: { target: YT.Player }) => {
  player.setVolume(readVolume());
  writeYTPlayer(player);
};

const handlePlaybackRateChange = ({ target: player }: { target: YT.Player }) => {
  const nextSpeed = player.getPlaybackRate();
  setMediaSpeed(nextSpeed);
  setNotify(Symbol(`x${nextSpeed.toFixed(2)}`));
};

const handleStateChange = (event: YouTubeEvent) => {
  if (event.data === YT.PlayerState.BUFFERING) {
    handleSeeked(event.target as YT.Player);
  }
};
