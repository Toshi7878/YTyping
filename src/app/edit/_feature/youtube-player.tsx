"use client";

import { useAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
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
const isStartedAtom = atomWithReset(false);
const ytDurationAtom = atomWithReset(0);
const mediaSpeedAtom = atomWithReset(1);

export const useYTPlayer = () => useAtomValue(YTPlayerAtom);
export const useYTDuration = () => useAtomValue(ytDurationAtom);
export const useYTSpeed = () => useAtomValue(mediaSpeedAtom);

export const YTPlayer = {
  getVideoId: () => store.get(YTPlayerAtom)?.getVideoData().video_id ?? "",
  getDuration: () => store.get(ytDurationAtom),
  getCurrentTime: () => store.get(YTPlayerAtom)?.getCurrentTime() ?? 0,
  getSpeed: () => store.get(mediaSpeedAtom),
  setSpeed: (speed: number) => store.get(YTPlayerAtom)?.setPlaybackRate(speed),
  isMount: () => store.get(YTPlayerAtom) !== null,
  isPlaying: () => store.get(YTPlayerAtom)?.getPlayerState() === YouTube.PlayerState.PLAYING,

  play: () => store.get(YTPlayerAtom)?.playVideo(),
  seek: (seconds: number) => store.get(YTPlayerAtom)?.seekTo(seconds, true),
  cueVideo: (videoId: string) => {
    setVideoId(videoId);
    isChangingVideo = true;
  },

  reset: () => {
    store.set(isStartedAtom, RESET);
    store.set(ytDurationAtom, RESET);
    store.set(mediaSpeedAtom, RESET);
    store.set(YTPlayerAtom, RESET);
  },
};

export const YouTubePlayer = ({ className }: { className: string }) => {
  const videoId = useVideoId();

  useHotkeys(
    "Escape",
    () => {
      if (isDialogOpen()) return;
      if (YTPlayer.isPlaying()) {
        store.get(YTPlayerAtom)?.pauseVideo();
      } else {
        YTPlayer.play();
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
  const mapId = getMapId();
  if (!mapId || isChangingVideo) {
    setMapEndTime(player);
  }

  isChangingVideo = false;
  store.set(YTPlayerAtom, player);
  store.set(isStartedAtom, false);
  store.set(ytDurationAtom, player.getDuration());
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
  if (!store.get(isStartedAtom)) {
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
  stopTimer();
};

const handleEnd = () => {
  stopTimer();
};

const onSeeked = ({ target: player }: { target: YT.Player }) => {
  setPlayingLineIndex(getLineCountByTime(player.getCurrentTime()));
};

const handleStateChange = (event: YouTubeEvent) => {
  if (document.activeElement instanceof HTMLIFrameElement) {
    document.activeElement.blur();
  }

  if (event.data === YouTube.PlayerState.BUFFERING) {
    onSeeked(event);
  }
};

const handlePlaybackRateChange = ({ target: player }: { target: YT.Player }) => {
  store.set(mediaSpeedAtom, player.getPlaybackRate());
};

const getLineCountByTime = (time: number): number => {
  const map = getRawMap();
  const nextIndex = map.findIndex((line) => Number(line.time) >= time);
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
