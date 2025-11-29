import type { TypingInputResult } from "lyrics-typing-engine";
import { readBuiltMap, readUtilityParams, setNewLine, setTypingWord } from "@/app/(typing)/type/_lib/atoms/state";
import { readLineCount } from "../../atoms/ref";
import { getRemainLineTime } from "../../youtube-player/get-youtube-time";
import { hasLineResultImproved, saveLineResult } from "../save-line-result";
import { triggerMissSound, triggerTypeSound } from "../sound-effect";
import { updateMissStatus, updateMissSubstatus } from "../update-status/miss";
import { recalculateStatusFromResults } from "../update-status/recalc-from-results";
import { updateSuccessStatus, updateSuccessSubstatus } from "../update-status/success";
import { updateKpmOnLineEnded, updateKpmOnTyping } from "../update-status/update-kpm";

export const processTypingInputResult = (typingInputResult: TypingInputResult) => {
  const { isCompleted, nextTypingWord, successKey, failKey, chunkType, updatePoint } = typingInputResult;
  const { constantLineTime, constantRemainLineTime } = getRemainLineTime();

  if (successKey) {
    setTypingWord(nextTypingWord);
    updateSuccessStatus({ isCompleted, constantRemainLineTime, updatePoint });

    const { isPaused } = readUtilityParams();
    if (!isPaused) {
      if (isCompleted) {
        updateKpmOnLineEnded({ constantLineTime });
      } else {
        updateKpmOnTyping({ constantLineTime });
      }
    }

    triggerTypeSound({ isCompleted });
    updateSuccessSubstatus({ constantLineTime, isCompleted, successKey, chunkType });

    if (isCompleted) {
      handleLineCompleted();
    }
  } else if ((nextTypingWord.correct.roma || nextTypingWord.correct.kana) && failKey) {
    triggerMissSound();
    updateMissStatus();
    updateMissSubstatus({ constantLineTime, failKey });
  }
};

const handleLineCompleted = () => {
  const count = readLineCount();

  if (hasLineResultImproved(count)) {
    saveLineResult(count);
  }

  const { scene, isPaused } = readUtilityParams();
  if (scene !== "practice") return;

  const map = readBuiltMap();
  if (!map) return;

  recalculateStatusFromResults({ count: map.lines.length - 1, updateType: "completed" });

  if (isPaused) {
    const newCurrentLine = map.lines[count];
    if (!newCurrentLine) return;
    setNewLine(newCurrentLine);
  }
};
