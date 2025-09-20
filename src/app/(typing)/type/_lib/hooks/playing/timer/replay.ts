import { useGameUtilityReferenceParams, useLineCount } from "@/app/(typing)/type/_lib/atoms/refAtoms";
import { usePlaySpeedReducer, useReadPlaySpeed } from "@/app/(typing)/type/_lib/atoms/speedReducerAtoms";
import {
  useReadAllLineResult,
  useReadGameUtilParams,
  useReadLineWord,
  useSetLineWord,
} from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { useCalcTypeSpeed } from "@/app/(typing)/type/_lib/hooks/playing/calcTypeSpeed";
import { useInputModeChange } from "@/app/(typing)/type/_lib/hooks/playing/inputModeChange";
import { ResultData, TypeResult } from "@/server/drizzle/validator/result";
import { YouTubeSpeed } from "@/types/global-types";
import { useGetTime } from "../getYTTime";
import { KanaInput, RomaInput, TypingKeys } from "../keydown/typingJudge";
import { useSoundEffect } from "../soundEffect";
import { useTypeMiss, useTypeSuccess, useUpdateAllStatus } from "../updateStatus";

interface UseKeyReplayProps {
  constantLineTime: number;
  type: TypeResult;
  lineResult: ResultData[number];
}

const usePlayBackKey = () => {
  const setLineWord = useSetLineWord();

  const inputModeChange = useInputModeChange();
  const dispatchSpeed = usePlaySpeedReducer();
  const { getConstantRemainLineTime } = useGetTime();

  const { updateSuccessStatus, updateSuccessStatusRefs } = useTypeSuccess();

  const { updateMissStatus, updateMissRefStatus } = useTypeMiss();
  const { triggerTypingSound, triggerMissSound } = useSoundEffect();
  const calcTypeSpeed = useCalcTypeSpeed();
  const updateAllStatus = useUpdateAllStatus();

  const readLineWord = useReadLineWord();
  const readGameStateUtils = useReadGameUtilParams();
  const { readCount } = useLineCount();

  return ({ constantLineTime, type }: UseKeyReplayProps) => {
    const { c: key, is: isSuccess, op: option } = type;
    const count = readCount();

    if (key) {
      const typingKeys: TypingKeys = {
        keys: [key],
        key: key,
        code: `Key${key.toUpperCase()}`,
      };

      if (isSuccess) {
        const { inputMode } = readGameStateUtils();
        const lineWord = readLineWord();
        const result =
          inputMode === "roma" ? new RomaInput({ typingKeys, lineWord }) : new KanaInput({ typingKeys, lineWord });
        setLineWord(result.newLineWord);
        const isCompleted = result.newLineWord.nextChar["k"] === "";
        triggerTypingSound({ isCompleted });

        const lineRemainConstantTime = getConstantRemainLineTime(constantLineTime);
        calcTypeSpeed({
          updateType: "keydown",
          constantLineTime,
        });

        updateSuccessStatusRefs({
          constantLineTime,
          successKey: result.successKey,
        });

        if (!isCompleted) {
          updateSuccessStatus({
            lineRemainConstantTime,
            updatePoint: result.updatePoint,
          });
        } else {
          updateAllStatus({ count, updateType: "completed" });
        }
      } else {
        triggerMissSound();
        updateMissStatus();
        updateMissRefStatus({ constantLineTime, failKey: key });
      }
    } else if (option) {
      switch (option) {
        case "roma":
          inputModeChange("roma");
          break;
        case "kana":
          inputModeChange("kana");
          break;
        case "speedChange":
          dispatchSpeed({ type: "toggle" });
          break;
      }
    }
  };
};

export const useReplay = () => {
  const keyReplay = usePlayBackKey();
  const readAllLineResults = useReadAllLineResult();

  const { readGameUtilRefParams, writeGameUtilRefParams } = useGameUtilityReferenceParams();
  const { readCount } = useLineCount();

  return ({ constantLineTime }: { constantLineTime: number }) => {
    const count = readCount();
    const lineResults = readAllLineResults();

    const lineResult = lineResults[count - 1];
    if (!lineResult) return;
    const { types } = lineResult;
    if (types.length === 0) return;

    const { replayKeyCount } = readGameUtilRefParams();
    const type = types[replayKeyCount];
    if (!type) return;

    const keyTime = type.t;

    if (constantLineTime >= keyTime) {
      keyReplay({ constantLineTime: constantLineTime, lineResult, type });
      writeGameUtilRefParams({ replayKeyCount: replayKeyCount + 1 });
    }
  };
};

export const useLineReplayUpdate = () => {
  const dispatchSpeed = usePlaySpeedReducer();
  const inputModeChange = useInputModeChange();

  const { writeGameUtilRefParams } = useGameUtilityReferenceParams();
  const readAllLineResults = useReadAllLineResult();
  const readPlaySpeed = useReadPlaySpeed();

  return (newCurrentCount: number) => {
    const lineResults = readAllLineResults();

    const lineResult = lineResults[newCurrentCount];

    if (!lineResult) {
      return;
    }

    inputModeChange(lineResult.status.mode);

    writeGameUtilRefParams({ replayKeyCount: 0 });

    const { playSpeed } = readPlaySpeed();
    const speed = lineResult.status.sp as YouTubeSpeed;

    if (playSpeed === speed) return;
    dispatchSpeed({ type: "set", payload: speed });
  };
};
