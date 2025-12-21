import type { YouTubeEvent } from "react-youtube";
import { readVolume } from "@/lib/atoms/global-atoms";
import { readMapId } from "../atoms/hydrate";
import { readRawMap } from "../atoms/map-reducer";
import { preventEditortabAutoFocus } from "../atoms/ref";
import {
  readYTPlayerStatus,
  setIsYTPlaying,
  setIsYTReadied,
  setIsYTStarted,
  setMediaSpeed,
  setPlayingLineIndex,
  setTabName,
  setYTChangingVideo,
  setYTDuration,
} from "../atoms/state";
import { setYTPlayer } from "../atoms/youtube-player";
import { updateEndTime } from "../map-table/update-end-time";
import { startTimer, stopTimer } from "./timer";

export const onReady = ({ target: player }: { target: YT.Player }) => {
  console.log("Ready");
  const mapId = readMapId();
  const { isChangingVideo } = readYTPlayerStatus();
  if (!mapId || isChangingVideo) {
    updateEndTime(player);
  }

  setYTPlayer(player);
  setYTChangingVideo(false);
  setIsYTPlaying(false);
  setIsYTReadied(true);
  setIsYTStarted(false);
  const duration = player.getDuration();
  setYTDuration(duration);
  player.setVolume(readVolume());
};

const onStart = (player: YT.Player) => {
  updateEndTime(player);
};

export const onPlay = ({ target: player }: { target: YT.Player }) => {
  console.log("再生 1");
  const { isStarted } = readYTPlayerStatus();

  if (!isStarted) {
    onStart(player);
  }

  startTimer();
  setIsYTStarted(true);
  setIsYTPlaying(true);

  if (preventEditortabAutoFocus()) return;
  setTabName("エディター");
};

export const onPause = () => {
  console.log("一時停止");
  stopTimer();
  setIsYTPlaying(false);
};

export const onEnd = () => {
  console.log("プレイ終了 動画完全停止");
  stopTimer();
  setIsYTPlaying(false);
};

const onSeeked = ({ target: player }: { target: YT.Player }) => {
  const time = player.getCurrentTime();
  console.log(`シークtime: ${time}`);
  setPlayingLineIndex(getLineCountByTime(time));
};

export const onStateChange = (event: YouTubeEvent) => {
  if (document.activeElement instanceof HTMLIFrameElement) {
    document.activeElement.blur();
  }

  if (event.data === YT.PlayerState.BUFFERING) {
    // seek時の処理
    onSeeked(event);
  }
};

export const onPlaybackRateChange = ({ target: player }: { target: YT.Player }) => {
  const nextSpeed = player.getPlaybackRate();
  setMediaSpeed(nextSpeed);
};

const getLineCountByTime = (time: number): number => {
  const map = readRawMap();

  const nextIndex = map.findIndex((line) => Number(line.time) >= time) ?? 0;
  return Math.max(0, nextIndex - 1);
};
