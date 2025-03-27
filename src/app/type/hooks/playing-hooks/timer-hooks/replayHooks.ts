import { useCountRef, useGameUtilsRef } from "@/app/type/atoms/refAtoms";
import { usePlaySpeedReducer } from "@/app/type/atoms/speedReducerAtoms";
import {
  useGameStateUtilsRef,
  useLineResultsStateRef,
  useLineWordStateRef,
  useSetLineWordState,
} from "@/app/type/atoms/stateAtoms";
import { useCalcTypeSpeed } from "@/app/type/hooks/calcTypeSpeed";
import { useInputModeChange } from "@/app/type/hooks/playing-hooks/useInputModeChange";
import { YouTubeSpeed } from "@/types";
import { KanaInput, RomaInput, TypingKeys } from "../../../ts/scene-ts/playing/keydown/typingJudge";
import { LineResultData, TypeResult } from "../../../ts/type";
import { useGetTime } from "../../useGetTime";
import { useSoundEffect } from "../useSoundEffect";
import { useTypeMiss, useTypeSuccess, useUpdateAllStatus } from "../useUpdateStatus";

interface UseKeyReplayProps {
  constantLineTime: number;
  typeResult: TypeResult;
  lineResult: LineResultData;
}

const useKeyReplay = () => {
  const setLineWord = useSetLineWordState();

  const inputModeChange = useInputModeChange();
  const dispatchSpeed = usePlaySpeedReducer();
  const { getConstantRemainLineTime } = useGetTime();

  const { updateSuccessStatus, updateSuccessStatusRefs } = useTypeSuccess();

  const { updateMissStatus, updateMissRefStatus } = useTypeMiss();
  const { triggerTypingSound, triggerMissSound } = useSoundEffect();
  const calcTypeSpeed = useCalcTypeSpeed();
  const updateAllStatus = useUpdateAllStatus();

  const readLineWord = useLineWordStateRef();
  const readGameStateUtils = useGameStateUtilsRef();
  const { readCount } = useCountRef();

  return ({ constantLineTime, typeResult }: UseKeyReplayProps) => {
    const key = typeResult.c;
    const isSuccess = typeResult.is;
    const option = typeResult.op;
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
          inputMode === "roma"
            ? new RomaInput({ typingKeys, lineWord })
            : new KanaInput({ typingKeys, lineWord });
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
  const keyReplay = useKeyReplay();
  const readLineResults = useLineResultsStateRef();

  const { readGameUtils, writeGameUtils } = useGameUtilsRef();
  const { readCount } = useCountRef();

  return ({ constantLineTime }: { constantLineTime: number }) => {
    const count = readCount();
    const lineResults = readLineResults();

    const lineResult: LineResultData = lineResults[count - 1];
    const typeResults = lineResult.typeResult;

    if (typeResults.length === 0) {
      return;
    }
    const replayKeyCount = readGameUtils().replayKeyCount;
    const typeData = typeResults[replayKeyCount];

    if (!typeData) {
      return;
    }

    const keyTime = typeData.t;

    if (constantLineTime >= keyTime) {
      keyReplay({ constantLineTime: constantLineTime, lineResult, typeResult: typeData });
      writeGameUtils({ replayKeyCount: replayKeyCount + 1 });
    }
  };
};

export const useLineReplayUpdate = () => {
  const dispatchSpeed = usePlaySpeedReducer();
  const inputModeChange = useInputModeChange();

  const { writeGameUtils } = useGameUtilsRef();
  const readLineResults = useLineResultsStateRef();

  return (newCount: number) => {
    const lineResults = readLineResults();

    const lineResult = lineResults[newCount];
    const lineInputMode = lineResult.status!.mode;
    const speed = lineResult.status!.sp as YouTubeSpeed;

    inputModeChange(lineInputMode);
    dispatchSpeed({ type: "set", payload: speed });
    writeGameUtils({ replayKeyCount: 0 });
  };
};
