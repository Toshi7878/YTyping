import { TIME_OFFSET_SHORTCUTKEY_RANGE } from "@/app/type/ts/const/typeDefaultValue";
import { LineWord } from "@/app/type/ts/type";
import {
  drawerClosureAtom,
  lineSelectIndexAtom,
  lineWordAtom,
  playingInputModeAtom,
  skipAtom,
  useMapAtom,
  useSceneAtom,
  useSetPlayingNotifyAtom,
  useSetTimeOffsetAtom,
  useUserOptionsAtom,
} from "@/app/type/type-atoms/gameRenderAtoms";
import { useRefs } from "@/app/type/type-contexts/refsProvider";
import { CreateMap } from "@/lib/instanceMapData";
import { UseDisclosureReturn } from "@chakra-ui/react";
import { useStore } from "jotai";
import { useVideoSpeedChange } from "../../useVideoSpeedChange";
import { useChangePlayMode } from "../useChangePlayMode";
import { useGamePause } from "../useGamePause";
import { useInputModeChange } from "../useInputModeChange";
import { useMoveLine } from "../useMoveLine";
import { usePressSkip } from "../usePressSkip";
import { useRetry } from "../useRetry";
import { useToggleLineList } from "../useToggleLineList";
import { useTyping } from "./useTyping";

export const useHandleKeydown = () => {
  const { ytStateRef, statusRef } = useRefs();
  const isKeydownTyped = useIsKeydownTyped();
  const typing = useTyping();
  const playingShortcutKey = usePlayingShortcutKey();
  const pauseShortcutKey = usePauseShortcutKey();
  const typeAtomStore = useStore();
  const scene = useSceneAtom();

  return (event: KeyboardEvent) => {
    const isPaused = ytStateRef.current?.isPaused;
    if (!isPaused || scene === "practice") {
      const count = statusRef.current!.status.count;
      const currentLineCount = count - 1;

      //ライン切り変えバグ回避(切り替わるギリギリでタイピングするとバグる)
      if (currentLineCount < 0) {
        return;
      }

      const lineWord = typeAtomStore.get(lineWordAtom);
      if (
        currentLineCount == lineWord.lineCount &&
        isKeydownTyped(event, lineWord) &&
        scene !== "replay"
      ) {
        event.preventDefault();

        typing({
          event,
          count,
          lineWord,
        });
      } else {
        playingShortcutKey(event);
      }
    } else if (isPaused) {
      pauseShortcutKey(event);
    }
  };
};

const keyWhiteList = ["F5"];
const ctrlKeyWhiteCodeList = ["KeyC"];
const altKeyWhiteCodeList = ["ArrowLeft", "ArrowRight"];
const openDrawerCtrlKeyCodeList = ["KeyF"];

const usePlayingShortcutKey = () => {
  const typeAtomStore = useStore();
  const { gameStateRef } = useRefs();
  const map = useMapAtom() as CreateMap;
  const scene = useSceneAtom();
  const userOptions = useUserOptionsAtom();

  const retry = useRetry();
  const pressSkip = usePressSkip();
  const gamePause = useGamePause();
  const inputModeChange = useInputModeChange();
  const toggleLineListDrawer = useToggleLineList();
  const changePlayMode = useChangePlayMode();
  const { defaultSpeedChange, playingSpeedChange } = useVideoSpeedChange();
  const { movePrevLine, moveNextLine, moveSetLine } = useMoveLine();
  const setTimeOffset = useSetTimeOffsetAtom();
  const setNotify = useSetPlayingNotifyAtom();

  return (event: KeyboardEvent) => {
    const drawerClosure = typeAtomStore.get(drawerClosureAtom) as UseDisclosureReturn;

    if (
      keyWhiteList.includes(event.code) ||
      (event.ctrlKey && ctrlKeyWhiteCodeList.includes(event.code)) ||
      (event.altKey && !event.ctrlKey && altKeyWhiteCodeList.includes(event.code)) ||
      (event.ctrlKey && openDrawerCtrlKeyCodeList.includes(event.code) && drawerClosure.isOpen)
    ) {
      return;
    }
    const inputMode = typeAtomStore.get(playingInputModeAtom);
    const skip = typeAtomStore.get(skipAtom);

    const isCtrlLeftRight = userOptions.time_offset_key === "CTRL_LEFT_RIGHT" && event.ctrlKey;
    const isCtrlAltLeftRight =
      userOptions.time_offset_key === "CTRL_ALT_LEFT_RIGHT" && event.ctrlKey && event.altKey;

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
          setTimeOffset((prev) => {
            const newValue = Math.round((prev + TIME_OFFSET_SHORTCUTKEY_RANGE) * 100) / 100;
            setNotify(Symbol(`時間調整:${(newValue + userOptions.time_offset).toFixed(2)}`));
            return newValue;
          });
        } else if (scene === "replay" || scene === "practice") {
          moveNextLine();
        }

        break;
      case "ArrowLeft":
        if (isCtrlLeftRight || isCtrlAltLeftRight) {
          setTimeOffset((prev) => {
            const newValue = Math.round((prev - TIME_OFFSET_SHORTCUTKEY_RANGE) * 100) / 100;
            setNotify(Symbol(`時間調整:${(newValue + userOptions.time_offset).toFixed(2)}`));
            return newValue;
          });
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
        if (userOptions.toggle_input_mode_key === "TAB") {
          if (scene === "replay" || scene === "practice") {
            toggleLineListDrawer();
          }
        }
        break;

      case "F4":
        const playMode = gameStateRef.current!.playMode;
        retry(playMode);
        break;
      case "F7":
        changePlayMode();
        break;
      case "F9":
        if (scene === "practice") {
          defaultSpeedChange("down");
        }
        break;
      case "F10":
        if (scene === "playing") {
          playingSpeedChange();
        } else if (scene === "practice") {
          defaultSpeedChange("up");
        }
        break;
      case "KanaMode":
      case "Romaji":
        if (userOptions.toggle_input_mode_key === "ALT_KANA") {
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
          const lineSelectIndex = typeAtomStore.get(lineSelectIndexAtom);
          const seekCount = map.typingLineNumbers[lineSelectIndex - 1];
          moveSetLine(seekCount);
        }
        break;

      case "Tab":
        if (userOptions.toggle_input_mode_key === "TAB") {
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

const CODES = [
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
];
const TENKEYS = [
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
];

const useIsKeydownTyped = () => {
  return (event: KeyboardEvent, lineWord: LineWord) => {
    if (event.ctrlKey || event.altKey) {
      return false;
    }

    const KEY_CODE = event.keyCode;
    const CODE = event.code;

    const IS_TYPE =
      (KEY_CODE >= 65 && KEY_CODE <= 90) ||
      CODES.includes(CODE) ||
      TENKEYS.includes(CODE) ||
      KEY_CODE === 0;
    //event.keyが"Process"になるブラウザの不具合が昔はあったので場合によっては追加する
    //ChatGPT「'Process' キーは通常、国際的なキーボードで入力方法やプロセスのキーを指すために使用されます。」

    const ACTIVE_ELEMENT = document.activeElement as HTMLInputElement;
    const HAS_FOCUS = ACTIVE_ELEMENT && ACTIVE_ELEMENT.type != "text";

    const KANA = lineWord.nextChar["k"];

    return IS_TYPE && HAS_FOCUS && KANA;
  };
};
