import { isDialogOpen } from "@/utils/is-dialog-option";
import { getBuiltMap } from "../../atoms/built-map";
import { getSelectLineIndex } from "../../atoms/line-results";
import { cycleYTPlaybackRate, pauseYTPlayer, playYTPlayer, stepYTPlaybackRate } from "../../atoms/youtube-player";
import { restartPlay } from "../../lib/play-restart";
import { getTypingOptions } from "../../tabs/setting/popover";
import { getIsPaused, getMinMediaSpeed } from "../../youtube/youtube-player";
import { getActiveSkipKey, skipLine } from "../footer/skip";
import { setNotify } from "../header/notify";
import { getScene } from "../typing-card";
import { moveNextLine, movePrevLine, moveSetLine } from "./move-line";
import { commitPlayModeChange } from "./play-scene-change";
import { getLineCount, getTimeOffset, setTimeOffset } from "./playing-scene";
import { togglePlayInputMode } from "./toggle-input-mode";

const KEY_WHITE_LIST = ["F5"];
const CTRL_KEY_WHITE_CODE_LIST = ["KeyC", "KeyV", "KeyZ", "KeyY", "KeyX"];
const ALT_KEY_WHITE_CODE_LIST = ["ArrowLeft", "ArrowRight"];
const OPEN_DIALOG_CTRL_KEY_CODE_LIST = ["KeyF"];

export const isHotKeyIgnored = (event: KeyboardEvent) => {
  return (
    KEY_WHITE_LIST.includes(event.code) ||
    (event.ctrlKey && CTRL_KEY_WHITE_CODE_LIST.includes(event.code)) ||
    (event.altKey && !event.ctrlKey && ALT_KEY_WHITE_CODE_LIST.includes(event.code)) ||
    (event.ctrlKey && OPEN_DIALOG_CTRL_KEY_CODE_LIST.includes(event.code) && isDialogOpen())
  );
};

const TIME_OFFSET_SHORTCUTKEY_RANGE = 0.1;

export const playHotkey = (event: KeyboardEvent) => {
  const map = getBuiltMap();
  if (!map) return;

  if (event.key === "Escape") {
    event.preventDefault();
    togglePause();
    return;
  }

  const typingOptions = getTypingOptions();

  const scene = getScene();
  const activeSkipKey = getActiveSkipKey();

  const isCtrlLeftRight = typingOptions.timeOffsetAdjustKey === "CTRL_LEFT_RIGHT" && event.ctrlKey;
  const isCtrlAltLeftRight =
    typingOptions.timeOffsetAdjustKey === "CTRL_ALT_LEFT_RIGHT" && event.ctrlKey && event.altKey;

  if (event.code === activeSkipKey) {
    event.preventDefault();
    const count = getLineCount();
    skipLine(count);
    return;
  }

  switch (event.code) {
    case "ArrowRight":
      if (isCtrlLeftRight || isCtrlAltLeftRight) {
        setTimeOffset((prev) => Math.round((prev + TIME_OFFSET_SHORTCUTKEY_RANGE) * 100) / 100);

        const timeOffset = getTimeOffset();
        setNotify(Symbol(`時間調整: ${(timeOffset + typingOptions.timeOffset).toFixed(2)}`));
      } else if (scene === "replay" || scene === "practice") {
        moveNextLine();
      }

      break;
    case "ArrowLeft":
      if (isCtrlLeftRight || isCtrlAltLeftRight) {
        setTimeOffset((prev) => Math.round((prev - TIME_OFFSET_SHORTCUTKEY_RANGE) * 100) / 100);
        const timeOffset = getTimeOffset();
        setNotify(Symbol(`時間調整: ${(timeOffset + typingOptions.timeOffset).toFixed(2)}`));
      } else if (scene === "replay" || scene === "practice") {
        movePrevLine();
      }
      break;

    case "F4": {
      const isPlaying = scene === "play" || scene === "practice" || scene === "replay";
      if (isPlaying) {
        restartPlay(scene);
      }
      break;
    }
    case "F7":
      commitPlayModeChange();
      break;
    case "F9":
      if (scene === "practice") {
        stepYTPlaybackRate("down");
      }
      break;
    case "F10":
      if (scene === "play") {
        const minMediaSpeed = getMinMediaSpeed();
        cycleYTPlaybackRate({ minSpeed: minMediaSpeed });
      } else if (scene === "practice") {
        stepYTPlaybackRate("up");
      }
      break;
    case "KanaMode":
    case "Romaji":
      if (typingOptions.inputModeToggleKey === "ALT_KANA") {
        if (scene !== "replay") {
          togglePlayInputMode();
        }
      }
      break;
    case "Backspace":
      if (scene === "replay" || scene === "practice") {
        const selectLineIndex = getSelectLineIndex();

        const seekCount = map.typingLineIndexes[selectLineIndex - 1];
        if (!seekCount) return;
        moveSetLine(seekCount);
      }
      break;

    case "Tab":
      if (typingOptions.inputModeToggleKey === "TAB") {
        if (scene !== "replay") {
          togglePlayInputMode();
        }
      }
      break;
  }
  event.preventDefault();
};

const togglePause = () => {
  const isPaused = getIsPaused();
  if (isPaused) {
    playYTPlayer();
  } else {
    pauseYTPlayer();
  }
};
