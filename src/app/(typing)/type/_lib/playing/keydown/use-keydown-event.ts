import {
  useReadGameUtilityParams,
  useReadLineWord,
  useReadMap,
  useSetCurrentLine,
  useSetLineWord,
} from "@/app/(typing)/type/_lib/atoms/state-atoms";
import { useLineCount } from "../../atoms/read-atoms";
import { useGetYouTubeTime } from "../../youtube-player/use-get-youtube-time";
import { useCalcTypeSpeed } from "../use-calc-type-speed";
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
  const readGameUtilityParams = useReadGameUtilityParams();

  return (event: KeyboardEvent) => {
    const { scene, isPaused } = readGameUtilityParams();

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

    const { lineResultdrawerClosure: drawerClosure } = readGameUtilityParams();

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
  const readGameUtilityParams = useReadGameUtilityParams();
  const readLineWord = useReadLineWord();

  return (event: KeyboardEvent) => {
    const { scene } = readGameUtilityParams();

    if (scene === "replay") return false;
    if (event.ctrlKey || event.altKey) return false;

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
  const getTime = useGetYouTubeTime();

  const calcTypeSpeed = useCalcTypeSpeed();
  const inputJudge = useTypingJudge();
  const { hasLineResultImproved, saveLineResult } = useUpdateLineResult();
  const readGameUtilityParams = useReadGameUtilityParams();
  const updateAllStatus = useUpdateAllStatus();
  const readMap = useReadMap();
  const { readCount } = useLineCount();
  const { setCurrentLine } = useSetCurrentLine();

  return (event: KeyboardEvent) => {
    const { isSuccess, isFailed, isCompleted, newLineWord, successKey, failKey, typeChunk, updatePoint } =
      inputJudge(event);
    const { constantLineTime, constantRemainLineTime } = getTime({ type: "remainLineTime" });
    if (!newLineWord) return;

    if (isSuccess && successKey) {
      setLineWord(newLineWord);
      triggerTypeSound({ isCompleted });

      requestAnimationFrame(() => {
        updateSuccessStatusRefs({
          constantLineTime,
          isCompleted,
          successKey,
          typeChunk,
        });

        updateSuccessStatus({
          isCompleted,
          constantRemainLineTime,
          updatePoint,
        });
        const { isPaused } = readGameUtilityParams();

        if (!isPaused) {
          calcTypeSpeed({
            updateType: isCompleted ? "completed" : "keydown",
            constantLineTime,
          });
        }

        if (isCompleted) {
          const count = readCount();

          if (hasLineResultImproved(count)) {
            saveLineResult(count);
          }

          const { scene } = readGameUtilityParams();
          if (scene === "practice") {
            const map = readMap();
            if (!map) return;

            updateAllStatus({
              count: map.mapData.length - 1,
              updateType: "completed",
            });

            if (isPaused) {
              const newCurrentLine = map.mapData[count];
              const newNextLine = map.mapData[count + 1];
              if (!newCurrentLine || !newNextLine) return;
              setCurrentLine({ newCurrentLine, newNextLine });
            }
          }
        }
      });
    } else if (isFailed && failKey) {
      triggerMissSound();

      requestAnimationFrame(() => {
        updateMissStatus();
        updateMissRefStatus({ constantLineTime, failKey });
      });
    }
  };
};
