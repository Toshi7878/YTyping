import { readUtilityRefParams, writeUtilityRefParams } from "../../../atoms/ref";
import { handlePlaySpeedAction } from "../../../atoms/speed-reducer";
import {
  readBuiltMap,
  readTypingOptions,
  readUtilityParams,
  setLineResultSheet,
  setNotify,
} from "../../../atoms/state";
import { commitPlayModeChange } from "../../commit-play-mode-change";
import { commitPlayRestart } from "../../commit-play-restart";
import { togglePlayInputMode } from "../../input-mode-change";
import { moveNextLine, movePrevLine, moveSetLine } from "../../move-line";
import { commitLineSkip } from "./commit-line-skip";
import { togglePause } from "./toggle-pause";

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
        handlePlaySpeedAction({ type: "down" });
      }
      break;
    case "F10":
      if (scene === "play") {
        handlePlaySpeedAction({ type: "toggle" });
      } else if (scene === "practice") {
        handlePlaySpeedAction({ type: "up" });
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
