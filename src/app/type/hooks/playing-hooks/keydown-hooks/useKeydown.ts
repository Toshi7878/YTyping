import { useGameUtilsRef, useYTStatusRef } from "@/app/type/atoms/refAtoms";
import { usePlaySpeedReducer } from "@/app/type/atoms/speedReducerAtoms";
import {
  useGameStateUtilsRef,
  useLineWordStateRef,
  useMapStateRef,
  useSceneState,
  useSetNotifyState,
  useUserTypingOptionsStateRef,
} from "@/app/type/atoms/stateAtoms";
import { TIME_OFFSET_SHORTCUTKEY_RANGE } from "@/app/type/ts/const/consts";
import { LineWord } from "@/app/type/ts/type";
import { useChangePlayMode } from "../useChangePlayMode";
import { useGamePause } from "../useGamePause";
import { useInputModeChange } from "../useInputModeChange";
import { useMoveLine } from "../useMoveLine";
import { usePressSkip } from "../usePressSkip";
import { useRetry } from "../useRetry";
import { useToggleLineList } from "../useToggleLineList";
import { useTyping } from "./useTyping";

export const useHandleKeydown = () => {
  const isKeydownTyped = useIsKeydownTyped();
  const typing = useTyping();
  const playingShortcutKey = usePlayingShortcutKey();
  const pauseShortcutKey = usePauseShortcutKey();

  const { readYTStatus } = useYTStatusRef();
  const readLineWord = useLineWordStateRef();
  const readGameStateUtils = useGameStateUtilsRef();

  return (event: KeyboardEvent) => {
    const { isPaused } = readYTStatus();
    const { scene } = readGameStateUtils();

    if (!isPaused || scene === "practice") {
      const lineWord = readLineWord();
      if (isKeydownTyped(event, lineWord) && scene !== "replay") {
        event.preventDefault();

        typing(event);
      } else {
        playingShortcutKey(event);
      }
    } else if (isPaused) {
      pauseShortcutKey(event);
    }
  };
};

const KEY_WHITE_LIST = ["F5"];
const CTRL_KEY_WHITE_CODE_LIST = ["KeyC", "KeyV", "KeyZ", "KeyY", "KeyX"];
const ALT_KEY_WHITE_CODE_LIST = ["ArrowLeft", "ArrowRight"];
const OPEN_DRAWER_CTRL_KEY_CODE_LIST = ["KeyF"];

const usePlayingShortcutKey = () => {
  const scene = useSceneState();

  const retry = useRetry();
  const pressSkip = usePressSkip();
  const gamePause = useGamePause();
  const inputModeChange = useInputModeChange();
  const toggleLineListDrawer = useToggleLineList();
  const changePlayMode = useChangePlayMode();
  const dispatchSpeed = usePlaySpeedReducer();
  const { movePrevLine, moveNextLine, moveSetLine } = useMoveLine();
  const setNotify = useSetNotifyState();

  const { readGameUtils, writeGameUtils } = useGameUtilsRef();
  const readTypingOptions = useUserTypingOptionsStateRef();
  const readMap = useMapStateRef();
  const readGameStateUtils = useGameStateUtilsRef();

  return (event: KeyboardEvent) => {
    const map = readMap();
    const { lineResultdrawerClosure: drawerClosure } = readGameUtils();
    const typingOptions = readTypingOptions();

    if (
      KEY_WHITE_LIST.includes(event.code) ||
      (event.ctrlKey && CTRL_KEY_WHITE_CODE_LIST.includes(event.code)) ||
      (event.altKey && !event.ctrlKey && ALT_KEY_WHITE_CODE_LIST.includes(event.code)) ||
      (event.ctrlKey && OPEN_DRAWER_CTRL_KEY_CODE_LIST.includes(event.code) && drawerClosure!.isOpen)
    ) {
      return;
    }

    const { inputMode, skip } = readGameStateUtils();

    const isCtrlLeftRight = typingOptions.time_offset_key === "CTRL_LEFT_RIGHT" && event.ctrlKey;
    const isCtrlAltLeftRight = typingOptions.time_offset_key === "CTRL_ALT_LEFT_RIGHT" && event.ctrlKey && event.altKey;

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
          const { timeOffset } = readGameUtils();
          const newTimeOffset = Math.round((timeOffset + TIME_OFFSET_SHORTCUTKEY_RANGE) * 100) / 100;
          writeGameUtils({ timeOffset: newTimeOffset });
          setNotify(Symbol(`時間調整: ${(newTimeOffset + typingOptions.time_offset).toFixed(2)}`));
        } else if (scene === "replay" || scene === "practice") {
          moveNextLine();
        }

        break;
      case "ArrowLeft":
        if (isCtrlLeftRight || isCtrlAltLeftRight) {
          const { timeOffset } = readGameUtils();
          const newTimeOffset = Math.round((timeOffset - TIME_OFFSET_SHORTCUTKEY_RANGE) * 100) / 100;
          writeGameUtils({ timeOffset: newTimeOffset });
          setNotify(Symbol(`時間調整: ${(newTimeOffset + typingOptions.time_offset).toFixed(2)}`));
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
        if (typingOptions.toggle_input_mode_key === "TAB") {
          if (scene === "replay" || scene === "practice") {
            toggleLineListDrawer();
          }
        }
        break;

      case "F4":
        const isPlaying = scene === "play" || scene === "practice" || scene === "replay";
        if (isPlaying) {
          retry(scene);
        }
        break;
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
        if (typingOptions.toggle_input_mode_key === "ALT_KANA") {
          if (scene !== "replay") {
            if (inputMode === "roma") {
              inputModeChange("kana");
            } else {
              inputModeChange("roma");
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
        if (typingOptions.toggle_input_mode_key === "TAB") {
          if (scene !== "replay") {
            if (inputMode === "roma") {
              inputModeChange("kana");
            } else {
              inputModeChange("roma");
            }
          }
        } else {
          if (scene === "replay" || scene === "practice") {
            toggleLineListDrawer();
          }
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

const CODES_SET = new Set([
  "Space",
  "Digit1",
  "Digit2",
  "Digit3",
  "Digit4",
  "Digit5",
  "Digit6",
  "Digit7",
  "Digit8",
  "Digit9",
  "Digit0",
  "Minus",
  "Equal",
  "IntlYen",
  "BracketLeft",
  "BracketRight",
  "Semicolon",
  "Quote",
  "Backslash",
  "Backquote",
  "IntlBackslash",
  "Comma",
  "Period",
  "Slash",
  "IntlRo",
  "Unidentified",
]);

const TENKEYS_SET = new Set([
  "Numpad1",
  "Numpad2",
  "Numpad3",
  "Numpad4",
  "Numpad5",
  "Numpad6",
  "Numpad7",
  "Numpad8",
  "Numpad9",
  "Numpad0",
  "NumpadDivide",
  "NumpadMultiply",
  "NumpadSubtract",
  "NumpadAdd",
  "NumpadDecimal",
]);

const useIsKeydownTyped = () => {
  return (event: KeyboardEvent, lineWord: LineWord) => {
    if (event.ctrlKey || event.altKey) return false;

    const activeElement = document.activeElement as HTMLInputElement | null;
    if (!activeElement || activeElement.type === "text") return false;

    const keyCode = event.keyCode;
    const code = event.code;

    const isType = (keyCode >= 65 && keyCode <= 90) || CODES_SET.has(code) || TENKEYS_SET.has(code);
    if (!isType) return false;

    return Boolean(lineWord.nextChar["k"]);
  };
};
