import { drawerClosureAtom } from "@/app/type/_components/typing-area/TypingCard";
import { TIME_OFFSET_SHORTCUTKEY_RANGE } from "@/app/type/ts/const/typeDefaultValue";
import { useIsKeydownTyped } from "@/app/type/ts/scene-ts/playing/keydown/typingJudge";
import {
  lineSelectIndexAtom,
  lineWordAtom,
  playingInputModeAtom,
  sceneAtom,
  skipAtom,
  useMapAtom,
  userOptionsAtom,
  useSetPlayingNotifyAtom,
  useSetTimeOffsetAtom,
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

  return (event: KeyboardEvent) => {
    const scene = typeAtomStore.get(sceneAtom);

    const isPaused = ytStateRef.current?.isPaused;
    if (!isPaused || scene === "practice") {
      const count = statusRef.current!.status.count;
      const currentLineCount = count - 1;

      //ライン切り変えバグ回避(切り替わるギリギリでタイピングするとバグる)
      if (currentLineCount < 0) {
        return;
      }

      const lineWord = typeAtomStore.get(lineWordAtom);

      if (currentLineCount == lineWord.lineCount && isKeydownTyped(event) && scene !== "replay") {
        event.preventDefault();

        typing({
          event,
          count,
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
  const map = useMapAtom() as CreateMap;

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
    const userOptions = typeAtomStore.get(userOptionsAtom);
    const scene = typeAtomStore.get(sceneAtom);
    const inputMode = typeAtomStore.get(playingInputModeAtom);
    const skip = typeAtomStore.get(skipAtom);

    const isCtrlLeftRight = userOptions.timeOffsetKey === "ctrl-left-right" && event.ctrlKey;
    const isCtrlAltLeftRight =
      userOptions.timeOffsetKey === "ctrl-alt-left-right" && event.ctrlKey && event.altKey;

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
            setNotify(Symbol(`時間調整:${(newValue + userOptions.timeOffset).toFixed(2)}`));
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
            setNotify(Symbol(`時間調整:${(newValue + userOptions.timeOffset).toFixed(2)}`));
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
        if (userOptions.toggleInputModeKey === "tab") {
          if (scene === "replay" || scene === "practice") {
            toggleLineListDrawer();
          }
        }
        break;

      case "F4":
        retry();
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
        if (userOptions.toggleInputModeKey === "alt-kana") {
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
        if (userOptions.toggleInputModeKey === "tab") {
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
