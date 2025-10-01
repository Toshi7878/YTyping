import { useReadYTStatus } from "@/app/(typing)/type/_lib/atoms/read-atoms";
import {
  useReadGameUtilParams,
  useReadLineWord,
  useReadMap,
  useSetCurrentLine,
  useSetLineWord,
} from "@/app/(typing)/type/_lib/atoms/state-atoms";
import { useLineCount } from "../../atoms/read-atoms";
import { useCalcTypeSpeed } from "../use-calc-type-speed";
import { useGetTime } from "../use-get-youtube-time";
import { useSoundEffect } from "../use-sound-effect";
import { useUpdateLineResult } from "../use-update-line-result";
import { useTypeMiss, useTypeSuccess, useUpdateAllStatus } from "../use-update-status";
import { useGamePause } from "./hot-key/use-game-pause";
import { usePlayingHotKey } from "./hot-key/use-hot-key";
import { useTypingJudge } from "./use-typing-judge";

const KEY_WHITE_LIST = ["F5"];
const CTRL_KEY_WHITE_CODE_LIST = ["KeyC", "KeyV", "KeyZ", "KeyY", "KeyX"];
const ALT_KEY_WHITE_CODE_LIST = ["ArrowLeft", "ArrowRight"];
const OPEN_DRAWER_CTRL_KEY_CODE_LIST = ["KeyF"];

export const useOnKeydown = () => {
  const isKeydownTyped = useIsKeydownTyped();
  const typing = useTyping();
  const handleHotKey = usePlayingHotKey();
  const gamePause = useGamePause();

  const { readYTStatus } = useReadYTStatus();
  const readGameStateUtils = useReadGameUtilParams();

  return (event: KeyboardEvent) => {
    const { isPaused } = readYTStatus();
    const { scene } = readGameStateUtils();

    if ((!isPaused || scene === "practice") && event.key !== "Escape") {
      if (isKeydownTyped(event)) {
        event.preventDefault();
        typing(event);
        return;
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      gamePause();
      return;
    }

    const { lineResultdrawerClosure: drawerClosure } = readGameStateUtils();

    const isAllowedKey =
      KEY_WHITE_LIST.includes(event.code) ||
      (event.ctrlKey && CTRL_KEY_WHITE_CODE_LIST.includes(event.code)) ||
      (event.altKey && !event.ctrlKey && ALT_KEY_WHITE_CODE_LIST.includes(event.code)) ||
      (event.ctrlKey && OPEN_DRAWER_CTRL_KEY_CODE_LIST.includes(event.code) && drawerClosure);
    if (isAllowedKey) return;

    handleHotKey(event);
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

    const { keyCode, code } = event;

    const isType = (keyCode >= 65 && keyCode <= 90) || CODES_SET.has(code) || TENKEYS_SET.has(code);
    if (!isType) return false;

    const lineWord = readLineWord();
    return Boolean(lineWord.nextChar.k);
  };
};

const useTyping = () => {
  const { triggerTypeSound, triggerMissSound } = useSoundEffect();

  const setLineWord = useSetLineWord();
  const { updateSuccessStatus, updateSuccessStatusRefs } = useTypeSuccess();

  const { updateMissStatus, updateMissRefStatus } = useTypeMiss();
  const { getCurrentLineTime, getCurrentOffsettedYTTime, getConstantLineTime, getConstantRemainLineTime } =
    useGetTime();
  const { readYTStatus } = useReadYTStatus();

  const calcTypeSpeed = useCalcTypeSpeed();
  const inputJudge = useTypingJudge();
  const { isLinePointUpdated, updateLineResult } = useUpdateLineResult();
  const readGameStateUtils = useReadGameUtilParams();
  const updateAllStatus = useUpdateAllStatus();
  const readMap = useReadMap();
  const { readCount } = useLineCount();
  const { setCurrentLine } = useSetCurrentLine();

  return (event: KeyboardEvent) => {
    const { isSuccess, isFailed, isCompleted, newLineWord, ...inputResult } = inputJudge(event);
    const constantLineTime = getConstantLineTime(getCurrentLineTime(getCurrentOffsettedYTTime()));

    if (isSuccess) {
      setLineWord(newLineWord);
      triggerTypeSound({ isCompleted });

      updateSuccessStatusRefs({
        constantLineTime,
        isCompleted,
        successKey: inputResult.successKey,
        typeChunk: inputResult.typeChunk,
      });

      updateSuccessStatus({
        isCompleted,
        lineRemainConstantTime: getConstantRemainLineTime(constantLineTime),
        updatePoint: inputResult.updatePoint,
      });
      const { isPaused } = readYTStatus();

      if (!isPaused) {
        calcTypeSpeed({
          updateType: isCompleted ? "completed" : "keydown",
          constantLineTime,
        });
      }

      if (isCompleted) {
        if (isLinePointUpdated()) {
          updateLineResult();
        }

        const { scene } = readGameStateUtils();
        if (scene === "practice") {
          const map = readMap();
          if (!map) return;

          updateAllStatus({
            count: map.mapData.length - 1,
            updateType: "completed",
          });

          if (isPaused) {
            const count = readCount();
            const newCurrentLine = map.mapData[count - 1];
            const newNextLine = map.mapData[count];
            setCurrentLine({ newCurrentLine, newNextLine });
          }
        }
      }
    } else if (isFailed) {
      triggerMissSound();
      updateMissStatus();
      updateMissRefStatus({ constantLineTime, failKey: inputResult.failKey });
    }
  };
};
