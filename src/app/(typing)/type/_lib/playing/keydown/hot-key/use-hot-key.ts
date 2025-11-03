import { readUtilityRefParams, writeUtilityRefParams } from "../../../atoms/ref";
import { handlePlaySpeedAction } from "../../../atoms/speed-reducer";
import {
  readBuiltMap,
  readTypingOptions,
  readUtilityParams,
  setLineResultSheet,
  setNotify,
  useSceneState,
} from "../../../atoms/state";
import { useChangePlayMode } from "../../use-change-play-mode";
import { useInputModeChange } from "../../use-input-mode-change";
import { useMoveLine } from "../../use-move-line";
import { useRetry } from "../../use-retry";
import { useGamePause } from "./use-game-pause";
import { usePressSkip } from "./use-press-skip";

const TIME_OFFSET_SHORTCUTKEY_RANGE = 0.1;

export const usePlayingHotKey = () => {
  const scene = useSceneState();

  const retry = useRetry();
  const pressSkip = usePressSkip();
  const gamePause = useGamePause();
  const inputModeChange = useInputModeChange();
  const changePlayMode = useChangePlayMode();
  const { movePrevLine, moveNextLine, moveSetLine } = useMoveLine();

  return (event: KeyboardEvent) => {
    const map = readBuiltMap();
    if (!map) return;
    const typingOptions = readTypingOptions();

    const { inputMode, activeSkipKey } = readUtilityParams();

    const isCtrlLeftRight = typingOptions.timeOffsetAdjustKey === "CTRL_LEFT_RIGHT" && event.ctrlKey;
    const isCtrlAltLeftRight =
      typingOptions.timeOffsetAdjustKey === "CTRL_ALT_LEFT_RIGHT" && event.ctrlKey && event.altKey;

    if (event.code === activeSkipKey) {
      pressSkip();
    }

    switch (event.code) {
      case "Escape": //Escでポーズ
        gamePause();
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
          retry(scene);
        }
        break;
      }
      case "F7":
        changePlayMode();
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
            if (inputMode === "roma") {
              void inputModeChange("kana");
            } else {
              void inputModeChange("roma");
            }
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
            if (inputMode === "roma") {
              void inputModeChange("kana");
            } else {
              void inputModeChange("roma");
            }
          }
        } else if (scene === "replay" || scene === "practice") {
          setLineResultSheet((prev) => !prev);
        }
        break;
    }
    event.preventDefault();
  };
};
