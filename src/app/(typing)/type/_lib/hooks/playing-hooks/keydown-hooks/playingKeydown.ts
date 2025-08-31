import { useGameUtilityReferenceParams, useYTStatus } from "@/app/(typing)/type/_lib/atoms/refAtoms";
import { usePlaySpeedReducer } from "@/app/(typing)/type/_lib/atoms/speedReducerAtoms";
import {
  useReadGameUtilParams,
  useReadLineWord,
  useReadMap,
  useSceneState,
  useSetLineResultDrawer,
  useSetNotify,
  useUserTypingOptionsStateRef,
} from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { useChangePlayMode } from "../changePlayScene";
import { useGamePause } from "../gamePause";
import { useInputModeChange } from "../inputModeChange";
import { useMoveLine } from "../moveLine";
import { usePressSkip } from "../pressSkip";
import { useRetry } from "../retry";
import { useTyping } from "./handleTyping";

const TIME_OFFSET_SHORTCUTKEY_RANGE = 0.1;

export const useHandleKeydown = () => {
  const isKeydownTyped = useIsKeydownTyped();
  const typing = useTyping();
  const playingShortcutKey = usePlayingShortcutKey();
  const pauseShortcutKey = usePauseShortcutKey();

  const { readYTStatus } = useYTStatus();
  const readGameStateUtils = useReadGameUtilParams();

  return (event: KeyboardEvent) => {
    const { isPaused } = readYTStatus();
    const { scene } = readGameStateUtils();

    if (!isPaused || scene === "practice") {
      if (isKeydownTyped(event)) {
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
  const setLineResultDrawer = useSetLineResultDrawer();
  const changePlayMode = useChangePlayMode();
  const dispatchSpeed = usePlaySpeedReducer();
  const { movePrevLine, moveNextLine, moveSetLine } = useMoveLine();
  const setNotify = useSetNotify();

  const { readGameUtilRefParams, writeGameUtilRefParams } = useGameUtilityReferenceParams();
  const readTypingOptions = useUserTypingOptionsStateRef();
  const readMap = useReadMap();
  const readGameStateUtils = useReadGameUtilParams();

  return (event: KeyboardEvent) => {
    const map = readMap();
    const { lineResultdrawerClosure: drawerClosure } = readGameStateUtils();
    const typingOptions = readTypingOptions();

    if (
      KEY_WHITE_LIST.includes(event.code) ||
      (event.ctrlKey && CTRL_KEY_WHITE_CODE_LIST.includes(event.code)) ||
      (event.altKey && !event.ctrlKey && ALT_KEY_WHITE_CODE_LIST.includes(event.code)) ||
      (event.ctrlKey && OPEN_DRAWER_CTRL_KEY_CODE_LIST.includes(event.code) && drawerClosure)
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
          const { timeOffset } = readGameUtilRefParams();
          const newTimeOffset = Math.round((timeOffset + TIME_OFFSET_SHORTCUTKEY_RANGE) * 100) / 100;
          writeGameUtilRefParams({ timeOffset: newTimeOffset });
          setNotify(Symbol(`時間調整: ${(newTimeOffset + typingOptions.time_offset).toFixed(2)}`));
        } else if (scene === "replay" || scene === "practice") {
          moveNextLine();
        }

        break;
      case "ArrowLeft":
        if (isCtrlLeftRight || isCtrlAltLeftRight) {
          const { timeOffset } = readGameUtilRefParams();
          const newTimeOffset = Math.round((timeOffset - TIME_OFFSET_SHORTCUTKEY_RANGE) * 100) / 100;
          writeGameUtilRefParams({ timeOffset: newTimeOffset });
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
            setLineResultDrawer((prev) => !prev);
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
            setLineResultDrawer((prev) => !prev);
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
  const readGameStateUtils = useReadGameUtilParams();
  const readLineWord = useReadLineWord();

  return (event: KeyboardEvent) => {
    const { scene } = readGameStateUtils();

    if (scene === "replay") return false;
    if (event.ctrlKey || event.altKey) return false;

    const activeElement = document.activeElement as HTMLInputElement | null;
    if (!activeElement || activeElement.type === "text") return false;

    const keyCode = event.keyCode;
    const code = event.code;

    const isType = (keyCode >= 65 && keyCode <= 90) || CODES_SET.has(code) || TENKEYS_SET.has(code);
    if (!isType) return false;

    const lineWord = readLineWord();
    return Boolean(lineWord.nextChar["k"]);
  };
};
