import type { TypingInputResult } from "lyrics-typing-engine";
import { readBuiltMap, readUtilityParams } from "@/app/(typing)/type/_lib/atoms/state";
import { readLineCount } from "../../atoms/ref";
import { setNewLine, setTypingWord } from "../../atoms/typing-word";
import { getRemainLineTime } from "../../youtube-player/get-youtube-time";
import { hasLineResultImproved, saveLineResult } from "../save-line-result";
import { triggerMissSound, triggerTypeSound } from "../sound-effect";
import { updateMissStatus, updateMissSubstatus } from "../update-status/miss";
import { recalculateStatusFromResults } from "../update-status/recalc-from-results";
import { updateSuccessStatus, updateSuccessSubstatus } from "../update-status/success";
import { updateTypingTimeOnLineEnded } from "../update-status/update-kpm";

export const processTypingInputResult = (typingInputResult: TypingInputResult) => {
  const { isCompleted, nextTypingWord, successKey, failKey, chunkType, updatePoint } = typingInputResult;
  const { constantLineTime, constantRemainLineTime } = getRemainLineTime();

  if (successKey) {
    triggerTypeSound({ isCompleted });
    setTypingWord(nextTypingWord);

    updateSuccessStatus({ isCompleted, constantRemainLineTime, updatePoint, constantLineTime });
    updateSuccessSubstatus({ constantLineTime, isCompleted, successKey, chunkType });

    const { isPaused } = readUtilityParams();

    if (isCompleted) {
      if (!isPaused) {
        updateTypingTimeOnLineEnded({ constantLineTime });
      }
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
