import { isDialogOpen } from "@/utils/is-dialog-option";
import { readTypingOptions } from "../../atoms/hydrate";
import { readUtilityRefParams, writeUtilityRefParams } from "../../atoms/ref";
import { readBuiltMap, readMinMediaSpeed, readUtilityParams, setLineResultSheet, setNotify } from "../../atoms/state";
import { cycleYTPlaybackRate, stepYTPlaybackRate } from "../../atoms/youtube-player";
import { commitLineSkip } from "../commit-line-skip";
import { commitPlayModeChange } from "../commit-play-mode-change";
import { commitPlayRestart } from "../commit-play-restart";
import { moveNextLine, movePrevLine, moveSetLine } from "../move-line";
import { togglePlayInputMode } from "../toggle-input-mode";
import { togglePause } from "../toggle-pause";

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

export const handlePlayHotKey = (event: KeyboardEvent) => {
  const map = readBuiltMap();
  if (!map) return;
  const typingOptions = readTypingOptions();

  const { scene, activeSkipKey } = readUtilityParams();

  const isCtrlLeftRight = typingOptions.timeOffsetAdjustKey === "CTRL_LEFT_RIGHT" && event.ctrlKey;
  const isCtrlAltLeftRight =
    typingOptions.timeOffsetAdjustKey === "CTRL_ALT_LEFT_RIGHT" && event.ctrlKey && event.altKey;

  if (event.code === activeSkipKey) {
    commitLineSkip();
  }

  switch (event.code) {
    case "Escape": //Escでポーズ
      togglePause();
      break;
    case "ArrowUp":
      break;
    case "ArrowDown":
      break;
    case "ArrowRight":
      if (isCtrlLeftRight || isCtrlAltLeftRight) {
        const { timeOffset } = readUtilityRefParams();
        const newTimeOffset = Math.round((timeOffset + TIME_OFFSET_SHORTCUTKEY_RANGE) * 100) / 100;
        writeUtilityRefParams({ timeOffset: newTimeOffset });
        setNotify(Symbol(`時間調整: ${(newTimeOffset + typingOptions.timeOffset).toFixed(2)}`));
      } else if (scene === "replay" || scene === "practice") {
        moveNextLine();
      }

      break;
    case "ArrowLeft":
      if (isCtrlLeftRight || isCtrlAltLeftRight) {
        const { timeOffset } = readUtilityRefParams();
        const newTimeOffset = Math.round((timeOffset - TIME_OFFSET_SHORTCUTKEY_RANGE) * 100) / 100;
        writeUtilityRefParams({ timeOffset: newTimeOffset });
        setNotify(Symbol(`時間調整: ${(newTimeOffset + typingOptions.timeOffset).toFixed(2)}`));
      } else if (scene === "replay" || scene === "practice") {
        movePrevLine();
      }
      break;
    case "F1":
      if (typingOptions.InputModeToggleKey === "TAB") {
        if (scene === "replay" || scene === "practice") {
          setLineResultSheet((prev) => !prev);
        }
      }
      break;

    case "F4": {
      const isPlaying = scene === "play" || scene === "practice" || scene === "replay";
      if (isPlaying) {
        commitPlayRestart(scene);
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
        const minMediaSpeed = readMinMediaSpeed();
        cycleYTPlaybackRate({ minSpeed: minMediaSpeed });
      } else if (scene === "practice") {
        stepYTPlaybackRate("up");
      }
      break;
    case "KanaMode":
    case "Romaji":
      if (typingOptions.InputModeToggleKey === "ALT_KANA") {
        if (scene !== "replay") {
          togglePlayInputMode();
        }
      }
      break;
    case "Backspace":
      if (scene === "replay" || scene === "practice") {
        const { lineSelectIndex } = readUtilityParams();
        const seekCount = map.typingLineIndexes[lineSelectIndex - 1];
        if (!seekCount) return;
        moveSetLine(seekCount);
      }
      break;

    case "Tab":
      if (typingOptions.InputModeToggleKey === "TAB") {
        if (scene !== "replay") {
          togglePlayInputMode();
        }
      } else if (scene === "replay" || scene === "practice") {
        setLineResultSheet((prev) => !prev);
      }
      break;
  }
  event.preventDefault();
};
