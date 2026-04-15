import { executeTypingInput, type InputMode, type TypingWord } from "lyrics-typing-engine";
import { readLineCount } from "@/app/(typing)/type/_feature/atoms/ref";
import {
  readMinMediaSpeed,
  readReplayRankingResult,
  readUtilityParams,
} from "@/app/(typing)/type/_feature/atoms/state";
import {
  applyKanaInputMode,
  applyRomaInputMode,
} from "@/app/(typing)/type/_feature/typing-card/playing/toggle-input-mode";
import type { TypeResult } from "@/validator/result";
import { readAllLineResult } from "../../../atoms/line-result";
import { setCombo, setLineKpm } from "../../../atoms/substatus";
import { getTypingWord, setTypingWord } from "../../../atoms/typing-word";
import { cycleYTPlaybackRate } from "../../../atoms/youtube-player";
import { triggerMissSound, triggerTypeCompletedSound, triggerTypeSound } from "../../../lib/sound-effect";
import { updateMissStatus, updateMissSubstatus } from "../update-status/miss";
import { recalculateStatusFromResults } from "../update-status/recalc-from-results";
import { updateSuccessStatus, updateSuccessSubstatus } from "../update-status/success";

export const simulateTypingInput = ({
  typeResult,
  constantLineTime,
  constantRemainLineTime,
}: {
  typeResult: Omit<TypeResult, "time">;
  constantLineTime: number;
  constantRemainLineTime: number;
}) => {
  const replayRankingResult = readReplayRankingResult();
  const isCaseSensitive = replayRankingResult?.otherStatus.isCaseSensitive ?? false;

  const { inputMode } = readUtilityParams();
  const typingWord = getTypingWord();

  evaluateInput(typeResult, inputMode, typingWord, isCaseSensitive, {
    onSuccess: ({ nextTypingWord, isCompleted, successKey, updatePoint }) => {
      if (isCompleted) {
        triggerTypeCompletedSound();
      } else {
        triggerTypeSound();
      }
      setTypingWord(nextTypingWord);
      updateSuccessStatus({ constantRemainLineTime, updatePoint, constantLineTime });
      updateSuccessSubstatus({ constantLineTime, successKey });
    },
    onMiss: ({ failKey }) => {
      triggerMissSound();
      updateMissStatus();
      updateMissSubstatus({ constantLineTime, failKey });
    },
    onLineCompleted: () => {
      const lineResults = readAllLineResult();
      const count = readLineCount();
      const lineResult = lineResults[count];

      recalculateStatusFromResults({ count: count + 1, updateType: "completed" });
      setCombo(lineResult?.status.combo ?? 0);
      setLineKpm(lineResult?.status.kpm ?? 0);
    },
    onOptionChange: (option) => {
      switch (option) {
        case "roma":
          applyRomaInputMode();
          break;
        case "kana":
          applyKanaInputMode();
          break;
        case "speedChange": {
          const minPlaySpeed = readMinMediaSpeed();
          cycleYTPlaybackRate({ minSpeed: minPlaySpeed });
          break;
        }
      }
    },
  });
};

const evaluateInput = (
  type: Omit<TypeResult, "time">,
  inputMode: InputMode,
  typingWord: TypingWord,
  isCaseSensitive: boolean,
  {
    onSuccess,
    onMiss,
    onLineCompleted,
    onOptionChange,
  }: {
    onSuccess: (result: {
      nextTypingWord: TypingWord;
      successKey: string;
      isCompleted: boolean;
      updatePoint: number;
    }) => void;
    onMiss: (result: { failKey: string }) => void;
    onLineCompleted: () => void;
    onOptionChange: (option: Required<TypeResult["option"]>) => void;
  },
) => {
  const { char: inputChar, isCorrect, option } = type;
  if (option) {
    onOptionChange(option);
    return;
  }

  if (inputChar) {
    if (isCorrect) {
      const { nextTypingWord, successKey, isCompleted, updatePoint } = executeTypingInput({
        inputChar,
        inputMode,
        typingWord,
        isCaseSensitive,
      });
      if (!successKey) return;
      onSuccess({ nextTypingWord, successKey, isCompleted, updatePoint });

      if (isCompleted) {
        onLineCompleted();
      }
    } else {
      onMiss({ failKey: inputChar });
    }
  }
};
