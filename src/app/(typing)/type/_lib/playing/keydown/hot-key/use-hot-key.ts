import { useGameUtilityReferenceParams } from "../../../atoms/read-atoms";
import { usePlaySpeedReducer } from "../../../atoms/speed-reducer-atoms";
import {
  useReadGameUtilParams,
  useReadMap,
  useReadUserTypingOptions,
  useSceneState,
  useSetLineResultDrawer,
  useSetNotify,
} from "../../../atoms/state-atoms";
import { useMoveLine } from "../../practice-replay/use-move-line";
import { useChangePlayMode } from "../../use-change-play-mode";
import { useInputModeChange } from "../../use-input-mode-change";
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
  const setLineResultDrawer = useSetLineResultDrawer();
  const changePlayMode = useChangePlayMode();
  const dispatchSpeed = usePlaySpeedReducer();
  const { movePrevLine, moveNextLine, moveSetLine } = useMoveLine();
  const setNotify = useSetNotify();

  const { readGameUtilRefParams, writeGameUtilRefParams } = useGameUtilityReferenceParams();
  const readTypingOptions = useReadUserTypingOptions();
  const readMap = useReadMap();
  const readGameStateUtils = useReadGameUtilParams();

  return (event: KeyboardEvent) => {
    const map = readMap();
    if (!map) return;
    const typingOptions = readTypingOptions();

    const { inputMode, skip } = readGameStateUtils();

    const isCtrlLeftRight = typingOptions.timeOffsetAdjustKey === "CTRL_LEFT_RIGHT" && event.ctrlKey;
    const isCtrlAltLeftRight =
      typingOptions.timeOffsetAdjustKey === "CTRL_ALT_LEFT_RIGHT" && event.ctrlKey && event.altKey;

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
          const { timeOffset } = readGameUtilRefParams();
          const newTimeOffset = Math.round((timeOffset + TIME_OFFSET_SHORTCUTKEY_RANGE) * 100) / 100;
          writeGameUtilRefParams({ timeOffset: newTimeOffset });
          setNotify(Symbol(`時間調整: ${(newTimeOffset + typingOptions.timeOffset).toFixed(2)}`));
        } else if (scene === "replay" || scene === "practice") {
          moveNextLine();
        }

        break;
      case "ArrowLeft":
        if (isCtrlLeftRight || isCtrlAltLeftRight) {
          const { timeOffset } = readGameUtilRefParams();
          const newTimeOffset = Math.round((timeOffset - TIME_OFFSET_SHORTCUTKEY_RANGE) * 100) / 100;
          writeGameUtilRefParams({ timeOffset: newTimeOffset });
          setNotify(Symbol(`時間調整: ${(newTimeOffset + typingOptions.timeOffset).toFixed(2)}`));
        } else if (scene === "replay" || scene === "practice") {
          movePrevLine();
        }
        break;
      case skip:
        if (skip !== "") {
          pressSkip();
        }
        break;
      case "F1":
        if (typingOptions.InputModeToggleKey === "TAB") {
          if (scene === "replay" || scene === "practice") {
            setLineResultDrawer((prev) => !prev);
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
          dispatchSpeed({ type: "down" });
        }
        break;
      case "F10":
        if (scene === "play") {
          dispatchSpeed({ type: "toggle" });
        } else if (scene === "practice") {
          dispatchSpeed({ type: "up" });
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
          const { lineSelectIndex } = readGameStateUtils();
          const seekCount = map.typingLineIndexes[lineSelectIndex - 1];
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
          setLineResultDrawer((prev) => !prev);
        }
        break;
    }
    event.preventDefault();
  };
};

const usePauseShortcutKey = () => {
  const gamePause = useGamePause();

  return (event: KeyboardEvent) => {
    switch (event.code) {
      case "Escape": //Escでポーズ
        gamePause();
        event.preventDefault();
        break;
    }
  };
};
