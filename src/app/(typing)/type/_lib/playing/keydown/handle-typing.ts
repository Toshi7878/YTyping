import { readBuiltMap, readUtilityParams, setLineWord, setNewLine } from "@/app/(typing)/type/_lib/atoms/state";
import { readLineCount } from "../../atoms/ref";
import { getRemainLineTime } from "../../youtube-player/get-youtube-time";
import { hasLineResultImproved, saveLineResult } from "../save-line-result";
import { triggerMissSound, triggerTypeSound } from "../sound-effect";
import { updateMissStatus, updateMissStatusRefs } from "../update-status/miss";
import { recalculateStatusFromResults } from "../update-status/recalc-from-results";
import { updateSuccessStatus, updateSuccessStatusRefs } from "../update-status/success";
import { updateKpmOnLineEnded, updateKpmOnTyping } from "../update-status/update-kpm";
import { evaluateTypingKeyEvent } from "./typing-input-evaluator";

const KEY_WHITE_LIST = ["F5"];
const CTRL_KEY_WHITE_CODE_LIST = ["KeyC", "KeyV", "KeyZ", "KeyY", "KeyX"];
const ALT_KEY_WHITE_CODE_LIST = ["ArrowLeft", "ArrowRight"];
const OPEN_DRAWER_CTRL_KEY_CODE_LIST = ["KeyF"];

export const isHotKeyIgnored = (event: KeyboardEvent) => {
  const { lineResultdrawerClosure: drawerClosure } = readUtilityParams();

  return (
    KEY_WHITE_LIST.includes(event.code) ||
    (event.ctrlKey && CTRL_KEY_WHITE_CODE_LIST.includes(event.code)) ||
    (event.altKey && !event.ctrlKey && ALT_KEY_WHITE_CODE_LIST.includes(event.code)) ||
    (event.ctrlKey && OPEN_DRAWER_CTRL_KEY_CODE_LIST.includes(event.code) && drawerClosure)
  );
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

export const isTypingKey = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.altKey) return false;
  const { keyCode, code } = event;

  const isType = (keyCode >= 65 && keyCode <= 90) || CODES_SET.has(code) || TENKEYS_SET.has(code);
  if (!isType) return false;

  return true;
};

export const handleTyping = (event: KeyboardEvent) => {
  const evaluateResult = evaluateTypingKeyEvent(event);
  const { isSuccess, isFailed, isCompleted, newLineWord, successKey, failKey, typeChunk, updatePoint } = evaluateResult;
  if (!newLineWord) return;
  const { constantLineTime, constantRemainLineTime } = getRemainLineTime();

  if (isSuccess && successKey) {
    setLineWord(newLineWord);
    triggerTypeSound({ isCompleted });

    updateSuccessStatusRefs({
      constantLineTime,
      isCompleted,
      successKey,
      typeChunk,
    });
    requestAnimationFrame(() => {
      updateSuccessStatus({
        isCompleted,
        constantRemainLineTime,
        updatePoint,
      });
      const { isPaused } = readUtilityParams();

      if (!isPaused) {
        updateKpmOnTyping({ constantLineTime });
      }

      if (isCompleted) {
        updateKpmOnLineEnded({ constantLineTime });
        const count = readLineCount();

        if (hasLineResultImproved(count)) {
          saveLineResult(count);
        }
        const { scene } = readUtilityParams();
        if (scene !== "practice") return;

        const map = readBuiltMap();
        if (!map) return;

        recalculateStatusFromResults({ count: map.lines.length - 1, updateType: "completed" });

        if (isPaused) {
          const newCurrentLine = map.lines[count];
          const newNextLine = map.lines[count + 1];
          if (!newCurrentLine || !newNextLine) return;
          setNewLine({ newCurrentLine, newNextLine });
        }
      }
    });
  } else if (isFailed && failKey) {
    triggerMissSound();

    requestAnimationFrame(() => {
      updateMissStatus();
      updateMissStatusRefs({ constantLineTime, failKey });
    });
  }
};
