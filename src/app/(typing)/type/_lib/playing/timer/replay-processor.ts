import {
  readLineCount,
  readUtilityRefParams,
  writeLineSubstatus,
  writeUtilityRefParams,
} from "@/app/(typing)/type/_lib/atoms/ref";
import { handlePlaySpeedAction } from "@/app/(typing)/type/_lib/atoms/speed-reducer";
import {
  readLineWord,
  readUtilityParams,
  setCombo,
  setLineKpm,
  setLineWord,
} from "@/app/(typing)/type/_lib/atoms/state";
import { applyKanaInputMode, applyRomaInputMode } from "@/app/(typing)/type/_lib/playing/toggle-input-mode";
import type { TypeResult } from "@/validator/result";
import { readAllLineResult } from "../../atoms/family";
import { calcTypeSpeed } from "../calc-type-speed";
import { KanaInput, RomaInput, type TypingKeys } from "../keydown/typing-input-evaluator";
import { triggerMissSound, triggerTypeSound } from "../sound-effect";
import { updateMissStatus, updateMissStatusRefs } from "../update-status/miss";
import { recalculateStatusFromResults } from "../update-status/recalc-from-results";
import { updateSuccessStatus, updateSuccessStatusRefs } from "../update-status/success";

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
  const { c: key, is: isSuccess, op: option } = type;
  const count = readLineCount();
  // 0ライン目に記録されてしまっているリプレイが存在するためcount === 0はリプレイしない
  if (count === 0) return;

  if (key) {
    const typingKeys: TypingKeys = {
      keys: [key],
      key,
      code: `Key${key.toUpperCase()}`,
    };

    if (isSuccess) {
      const { inputMode } = readUtilityParams();
      const lineWord = readLineWord();
      const { newLineWord, successKey, updatePoint } =
        inputMode === "roma" ? new RomaInput({ typingKeys, lineWord }) : new KanaInput({ typingKeys, lineWord });

      if (!newLineWord || !successKey) return;

      setLineWord(newLineWord);
      const isCompleted = newLineWord.nextChar.k === "";
      triggerTypeSound({ isCompleted });

      calcTypeSpeed({ updateType: "keydown", constantLineTime });

      updateSuccessStatusRefs({ constantLineTime, successKey });

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
      updateMissStatusRefs({ constantLineTime, failKey: key });
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
