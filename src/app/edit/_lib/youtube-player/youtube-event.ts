import type { YouTubeEvent } from "react-youtube";
import { readVolume } from "@/lib/atoms/global-atoms";
import { readMap } from "../atoms/map-reducer";
import { preventEditortabAutoFocus, writeYTPlayer } from "../atoms/ref";
import {
  readYTPlayerStatus,
  setIsYTPlaying,
  setIsYTReadied,
  setIsYTStarted,
  setTabName,
  setTimeLineIndex,
  setYTChangingVideo,
  setYTDuration,
} from "../atoms/state";
import { updateEndTime } from "../map-table/update-end-time";
import { timerControls } from "./timer";

export const onReady = (event: { target: YT.Player }) => {
  console.log("Ready");
  const player = event.target;

  const endLine = readMap().findLast((line) => line.lyrics === "end");
  const { changingVideo } = readYTPlayerStatus();
  const duration = player.getDuration();
  if (changingVideo && duration.toFixed(0) !== Number(endLine?.time).toFixed(0)) {
    updateEndTime(player);
  }

  writeYTPlayer(player);
  player.setVolume(readVolume());

  setYTChangingVideo(false);
  setIsYTPlaying(false);
  setIsYTReadied(true);
  setIsYTStarted(false);
  setYTDuration(duration);
};

export const onPlay = () => {
  console.log("再生 1");

  timerControls.startTimer();
  setIsYTPlaying(true);
  setIsYTStarted(true);

  if (preventEditortabAutoFocus()) return;
  setTabName("エディター");
};

export const onPause = () => {
  console.log("一時停止");
  timerControls.stopTimer();
  setIsYTPlaying(false);
};

export const onEnd = () => {
  console.log("プレイ終了 動画完全停止");
  timerControls.stopTimer();
  setIsYTPlaying(false);
};

const onSeeked = (event: YouTubeEvent) => {
  const time = event.target.getCurrentTime();
  console.log(`シークtime: ${time}`);
  setTimeLineIndex(getSeekedCount(time));
};

export const onStateChange = (event: YouTubeEvent) => {
  if (document.activeElement instanceof HTMLIFrameElement) {
    document.activeElement.blur();
  }

  if (event.data === 3) {
    // seek時の処理
    onSeeked(event);
  } else if (event.data === 1) {
    //	未スタート、他の動画に切り替えた時など
    console.log("未スタート -1");
  }
};

const getSeekedCount = (time: number) => {
  let count = 0;

  const map = readMap();
  for (const [i, line] of map.entries()) {
    if (Number(line.time) - time >= 0) {
      count = i - 1;
      break;
    }
  }

  if (count < 0) {
    count = 0;
  }

  return count;
};
