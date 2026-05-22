"use client";

import { useAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import { focusAtom } from "jotai-optics";
import { useHotkeys } from "react-hotkeys-hook";
import YouTube, { type YouTubeEvent } from "react-youtube";
import { getVolume } from "@/store/volume";
import { LoadingOverlayProvider } from "@/ui/overlay";
import { cn } from "@/utils/cn";
import { isDialogOpen } from "@/utils/is-dialog-option";
import { getRawMap, setRawMapAction } from "./map-table/map-reducer";
import { setPlayingLineIndex } from "./map-table/map-table";
import { startTimer, stopTimer } from "./playback/timer";
import { getMapId, setVideoId, store, useVideoId } from "./provider";
import { setTabName } from "./tabs/tabs";

const YTPlayerAtom = atomWithReset<YT.Player | null>(null);
const YTAtom = atomWithReset({
  isReadied: false,
  isStarted: false,
  mediaSpeed: 1,
  duration: 0,
});

const isReadiedAtom = focusAtom(YTAtom, (optic) => optic.prop("isReadied"));
const isStartedAtom = focusAtom(YTAtom, (optic) => optic.prop("isStarted"));
const ytDurationAtom = focusAtom(YTAtom, (optic) => optic.prop("duration"));
const mediaSpeedAtom = focusAtom(YTAtom, (optic) => optic.prop("mediaSpeed"));

export const YTPlayer = {
  usePlayer: () => useAtomValue(YTPlayerAtom),
  getVideoId: () => store.get(YTPlayerAtom)?.getVideoData().video_id ?? "",
  useDuration: () => useAtomValue(ytDurationAtom),
  getDuration: () => store.get(ytDurationAtom),
  getCurrentTime: () => store.get(YTPlayerAtom)?.getCurrentTime() ?? 0,
  useSpeed: () => useAtomValue(mediaSpeedAtom),
  getSpeed: () => store.get(mediaSpeedAtom),
  setSpeed: (speed: number) => store.get(YTPlayerAtom)?.setPlaybackRate(speed),
  isMount: () => store.get(YTPlayerAtom) !== null,
  isReadied: () => store.get(isReadiedAtom),
  isStarted: () => store.get(isStartedAtom),
  isPlaying: () => store.get(YTPlayerAtom)?.getPlayerState() === YouTube.PlayerState.PLAYING,

  play: () => store.get(YTPlayerAtom)?.playVideo(),
  pause: () => store.get(YTPlayerAtom)?.playVideo(),
  seek: (seconds: number) => store.get(YTPlayerAtom)?.seekTo(seconds, true),
  cueVideo: (videoId: string) => {
    // TODO: player.cueVideoを使うように変更
    setVideoId(videoId);
    isChangingVideo = true;
  },
  reset: () => {
    store.set(YTAtom, RESET);
    store.set(YTPlayerAtom, RESET);
  },
};

export const YouTubePlayer = ({ className }: { className: string }) => {
  const videoId = useVideoId();

  useHotkeys(
    "Escape",
    () => {
      if (isDialogOpen()) return;
      const isPlaying = YTPlayer.isPlaying();
      if (!isPlaying) {
        YTPlayer.play();
      } else {
        YTPlayer.pause();
      }
    },
    { enableOnFormTags: ["slider"], preventDefault: true },
  );

  return (
    <div className="relative h-fit">
      <LoadingOverlayProvider isLoading={!videoId} description="動画読込中..." asChild>
        <YouTube
          className={cn(className, !videoId && "invisible")}
          id="edit_youtube"
          videoId={videoId}
          opts={{
            width: "100%",
            height: "100%",
            playerVars: { enablejsapi: 1 },
          }}
          onReady={handleReady}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnd={handleEnd}
          onStateChange={handleStateChange}
          onPlaybackRateChange={handlePlaybackRateChange}
        />
      </LoadingOverlayProvider>
    </div>
  );
};

let isChangingVideo = false;

const handleReady = ({ target: player }: { target: YT.Player }) => {
  console.log("Ready");
  const mapId = getMapId();
  if (!mapId || isChangingVideo) {
    setMapEndTime(player);
  }

  isChangingVideo = false;
  store.set(YTPlayerAtom, player);
  store.set(isReadiedAtom, true);
  store.set(isStartedAtom, false);
  const duration = player.getDuration();
  store.set(ytDurationAtom, duration);
  player.setVolume(getVolume());
};

const handleStart = (player: YT.Player) => {
  setMapEndTime(player);
};

let isPreventEditorTabAutoFocus = false;
export const preventEditorTabAutoFocus = () => {
  isPreventEditorTabAutoFocus = true;
};

const handlePlay = ({ target: player }: { target: YT.Player }) => {
  console.log("再生 1");
  const isStarted = YTPlayer.isStarted();

  if (!isStarted) {
    handleStart(player);
  }

  startTimer();
  store.set(isStartedAtom, true);

  if (isPreventEditorTabAutoFocus) {
    isPreventEditorTabAutoFocus = false;
    return;
  }
  setTabName("エディター");
};

const handlePause = () => {
  console.log("一時停止");
  stopTimer();
};

const handleEnd = () => {
  console.log("プレイ終了 動画完全停止");
  stopTimer();
};

const onSeeked = ({ target: player }: { target: YT.Player }) => {
  const time = player.getCurrentTime();
  console.log(`シークtime: ${time}`);
  setPlayingLineIndex(getLineCountByTime(time));
};

const handleStateChange = (event: YouTubeEvent) => {
  if (document.activeElement instanceof HTMLIFrameElement) {
    document.activeElement.blur();
  }

  if (event.data === YouTube.PlayerState.BUFFERING) {
    // seek時の処理
    onSeeked(event);
  }
};

const handlePlaybackRateChange = ({ target: player }: { target: YT.Player }) => {
  const nextSpeed = player.getPlaybackRate();
  store.set(mediaSpeedAtom, nextSpeed);
};

const getLineCountByTime = (time: number): number => {
  const map = getRawMap();

  const nextIndex = map.findIndex((line) => Number(line.time) >= time) ?? 0;
  return Math.max(0, nextIndex - 1);
};

const setMapEndTime = (player: YT.Player) => {
  const duration = player.getDuration();
  if (!duration) return;

  const map = getRawMap();
  const endLineIndex = map.findLastIndex((item) => item.lyrics === "end");
  const endLine = { time: duration.toFixed(3), lyrics: "end", word: "" };

  if (endLineIndex === -1) {
    setRawMapAction({ type: "add", payload: endLine });
  } else {
    setRawMapAction({ type: "update", payload: endLine, index: endLineIndex });
  }
};
