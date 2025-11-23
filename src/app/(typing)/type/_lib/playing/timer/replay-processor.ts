import { executeTypingInput } from "lyrics-typing-engine";
import {
  readLineCount,
  readUtilityRefParams,
  writeLineSubstatus,
  writeUtilityRefParams,
} from "@/app/(typing)/type/_lib/atoms/ref";
import { handlePlaySpeedAction } from "@/app/(typing)/type/_lib/atoms/speed-reducer";
import {
  readTypingWord,
  readUtilityParams,
  setCombo,
  setLineKpm,
  setTypingWord,
} from "@/app/(typing)/type/_lib/atoms/state";
import { applyKanaInputMode, applyRomaInputMode } from "@/app/(typing)/type/_lib/playing/toggle-input-mode";
import type { TypeResult } from "@/validator/result";
import { readAllLineResult } from "../../atoms/family";
import { triggerMissSound, triggerTypeSound } from "../sound-effect";
import { updateMissStatus, updateMissSubstatus } from "../update-status/miss";
import { recalculateStatusFromResults } from "../update-status/recalc-from-results";
import { updateSuccessStatus, updateSuccessSubstatus } from "../update-status/success";
import { updateKpmOnTyping } from "../update-status/update-kpm";

export const processReplayKeyAtTimestamp = ({
  constantLineTime,
  constantRemainLineTime,
}: {
  constantLineTime: number;
  constantRemainLineTime: number;
}) => {
  const count = readLineCount();
  const lineResults = readAllLineResult();

  const lineResult = lineResults[count];
  if (!lineResult) return;
  const { types } = lineResult;
  if (types.length === 0) return;

  const { replayKeyCount } = readUtilityRefParams();
  const type = types[replayKeyCount];
  if (!type) return;

  const keyTime = type.t;

  if (constantLineTime >= keyTime) {
    simulateRecordedKeyInput({ constantLineTime, constantRemainLineTime, type });
    writeUtilityRefParams({ replayKeyCount: replayKeyCount + 1 });
  }
};

interface SimulateKeyInputParams {
  constantLineTime: number;
  constantRemainLineTime: number;
  type: TypeResult;
}

const simulateRecordedKeyInput = ({ constantLineTime, constantRemainLineTime, type }: SimulateKeyInputParams) => {
  const { c: inputChar, is: isSuccess, op: option } = type;
  const count = readLineCount();
  // 0ライン目に記録されてしまっているリプレイが存在するためcount === 0はリプレイしない
  if (count === 0) return;

  if (inputChar) {
    if (isSuccess) {
      const { inputMode } = readUtilityParams();
      const typingWord = readTypingWord();
      const { nextTypingWord, successKey, isCompleted, updatePoint } = executeTypingInput(
        inputChar,
        inputMode,
        typingWord,
      );

      if (!nextTypingWord || !successKey) return;

      setTypingWord(nextTypingWord);
      triggerTypeSound({ isCompleted });

      updateKpmOnTyping({ constantLineTime });
      updateSuccessSubstatus({ constantLineTime, successKey });

      if (!isCompleted) {
        updateSuccessStatus({ constantRemainLineTime, updatePoint });
      } else {
        const lineResults = readAllLineResult();
        const lineResult = lineResults[count];

        recalculateStatusFromResults({ count, updateType: "completed" });
        writeLineSubstatus({ isCompleted: true });
        setCombo(lineResult?.status.combo ?? 0);
        setLineKpm(lineResult?.status.lKpm ?? 0);
      }
    } else {
      triggerMissSound();
      updateMissStatus();
      updateMissSubstatus({ constantLineTime, failKey: inputChar });
    }
  } else if (option) {
    switch (option) {
      case "roma":
        applyRomaInputMode();
        break;
      case "kana":
        applyKanaInputMode();
        break;
      case "speedChange":
        handlePlaySpeedAction({ type: "toggle" });
        break;
    }
  }
};
