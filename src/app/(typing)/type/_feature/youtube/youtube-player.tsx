"use client";

import { atom, type SetStateAction, useAtomValue } from "jotai";
import YouTube, { type YouTubeEvent } from "react-youtube";
import { LoadingOverlayProvider } from "@/components/ui/overlay";
import { getReadyInputMode, getVolume } from "@/lib/atoms/global-atoms";
import { useIsMobileDeviceState } from "@/lib/atoms/user-agent";
import { mutatePlayCountStats } from "@/lib/mutations/play-count";
import { cn } from "@/lib/utils";
import { getBaseUrl } from "@/utils/get-base-url";
import { windowFocus } from "@/utils/window-focus";
import { getBuiltMap, setLastLineEndTime } from "../atoms/built-map";
import { store } from "../atoms/store";
import { setPlayingInputMode } from "../atoms/typing-word";
import { pauseYTPlayer, playYTPlayer, writeYTPlayer } from "../atoms/youtube-player";
import { iosActiveSound } from "../lib/sound-effect";
import { getMapId } from "../provider";
import { setTabName } from "../tabs/tabs";
import { setNotify } from "../typing-card/header/notify";
import { setLineCount } from "../typing-card/playing/playing-scene";
import { startTimer, stopTimer } from "../typing-card/playing/timer/timer";
import { getScene, getSceneGroup, setScene } from "../typing-card/typing-card";
import { dispatchTypeEvent } from "../user-script";

const isYTStartedAtom = atom(false);
const isPausedAtom = atom(false);
const mediaSpeedAtom = atom(1);
const minMediaSpeedAtom = atom(1);

export const useIsPausedState = () => useAtomValue(isPausedAtom);
export const getIsPaused = () => store.get(isPausedAtom);
const setIsPaused = (updater: SetStateAction<boolean>) => store.set(isPausedAtom, updater);

export const useMediaSpeedState = () => useAtomValue(mediaSpeedAtom);
export const getMediaSpeed = () => store.get(mediaSpeedAtom);
const setMediaSpeed = (updater: SetStateAction<number>) => store.set(mediaSpeedAtom, updater);

export const useMinMediaSpeedState = () => useAtomValue(minMediaSpeedAtom);
export const getMinMediaSpeed = () => store.get(minMediaSpeedAtom);
export const setMinMediaSpeed = (value: number) => store.set(minMediaSpeedAtom, value);

export const useYTStartedState = () => useAtomValue(isYTStartedAtom);
const getIsYTStarted = () => store.get(isYTStartedAtom);
const setYTStarted = (value: boolean) => store.set(isYTStartedAtom, value);

export const resetYoutubeStatus = () => {
  store.set(isYTStartedAtom, false);
  store.set(isPausedAtom, false);
  store.set(mediaSpeedAtom, 1);
  store.set(minMediaSpeedAtom, 1);
};

interface YouTubePlayerProps {
  isMapLoading: boolean;
  videoId: string;
  className?: string;
}

export const YouTubePlayer = ({ isMapLoading, videoId, className = "" }: YouTubePlayerProps) => {
  const isMobile = useIsMobileDeviceState();

  return (
    <LoadingOverlayProvider
      isLoading={isMapLoading}
      description="譜面読み込み中..."
      overlayClassName="bg-overlay-background/50"
    >
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
    const isPaused = getIsPaused();
    const scene = getScene();
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
  const scene = getScene();
  const map = getBuiltMap();
  if (!map) return;
  setLastLineEndTime(map, player.getDuration());
  const mapId = getMapId();
  if (mapId) {
    mutatePlayCountStats({ mapId });
  }
  setTabName("ステータス");
  setYTStarted(true);
  player.seekTo(0, true);
  if (scene === "replay") return;

  const minMediaSpeed = getMinMediaSpeed();
  if (minMediaSpeed < 1) {
    setScene("practice");
  } else if (scene === "ready") {
    setScene("play");
  }

  const readyInputMode = getReadyInputMode();
  setPlayingInputMode(readyInputMode);
  dispatchTypeEvent("yt:start", { scene: getScene() });
};

const handlePlay = async ({ target: player }: { target: YT.Player }) => {
  windowFocus();

  console.log("再生 1");

  const isYTStarted = getIsYTStarted();
  const isPaused = getIsPaused();
  const scene = getScene();
  const sceneGroup = getSceneGroup();

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

  dispatchTypeEvent("yt:play", {});
};

const handlePause = () => {
  console.log("一時停止");

  stopTimer();

  const isPaused = getIsPaused();
  const scene = getScene();
  if (!isPaused) {
    setIsPaused(true);
    dispatchTypeEvent("yt:pause", {});
    if (scene === "practice") return;
    setNotify(Symbol("ll"));
  }
};

const handleSeeked = (player: YT.Player) => {
  const time = player.getCurrentTime();

  if (time === 0) {
    setLineCount(0);
  }

  console.log("シーク");
  dispatchTypeEvent("yt:seeked", { time });
};

const handleReady = ({ target: player }: { target: YT.Player }) => {
  player.setVolume(getVolume());
  writeYTPlayer(player);
  dispatchTypeEvent("yt:ready", {});
};

const handlePlaybackRateChange = ({ target: player }: { target: YT.Player }) => {
  const nextSpeed = player.getPlaybackRate();
  setMediaSpeed(nextSpeed);
  setNotify(Symbol(`x${nextSpeed.toFixed(2)}`));
  dispatchTypeEvent("yt:rateChange", { speed: nextSpeed });
};

const handleStateChange = (event: YouTubeEvent) => {
  if (event.data === YT.PlayerState.BUFFERING) {
    handleSeeked(event.target as YT.Player);
  }
  dispatchTypeEvent("yt:stateChange", { state: event.data });
};
