import { useGameStateUtilsRef, useMapStateRef, useSetLineWordState } from "@/app/type/atoms/stateAtoms";
import { useInputJudge } from "@/app/type/hooks/playing-hooks/keydown-hooks/typingJudge";
import { useCalcTypeSpeed } from "../calcTypeSpeed";
import { useGetTime } from "../getYTTime";
import { useSoundEffect } from "../soundEffect";
import { useUpdateLineResult } from "../updateLineResult";
import { useTypeMiss, useTypeSuccess, useUpdateAllStatus } from "../updateStatus";

export const useTyping = () => {
  const { triggerTypingSound, triggerMissSound } = useSoundEffect();

  const setLineWord = useSetLineWordState();
  const { updateSuccessStatus, updateSuccessStatusRefs } = useTypeSuccess();

  const { updateMissStatus, updateMissRefStatus } = useTypeMiss();
  const { getCurrentLineTime, getCurrentOffsettedYTTime, getConstantLineTime, getConstantRemainLineTime } =
    useGetTime();
  const calcTypeSpeed = useCalcTypeSpeed();
  const inputJudge = useInputJudge();
  const { isLinePointUpdated, updateLineResult } = useUpdateLineResult();
  const readGameStateUtils = useGameStateUtilsRef();
  const updateAllStatus = useUpdateAllStatus();
  const readMap = useMapStateRef();

  return (event: KeyboardEvent) => {
    const { isSuccess, isFailed, isCompleted, newLineWord, ...inputResult } = inputJudge(event);
    const constantLineTime = getConstantLineTime(getCurrentLineTime(getCurrentOffsettedYTTime()));

    if (isSuccess) {
      setLineWord(newLineWord);
      triggerTypingSound({ isCompleted });

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

      calcTypeSpeed({
        updateType: isCompleted ? "completed" : "keydown",
        constantLineTime,
      });

      if (isCompleted) {
        if (isLinePointUpdated()) {
          updateLineResult();
        }

        const { scene } = readGameStateUtils();
        if (scene === "practice") {
          updateAllStatus({
            count: readMap().mapData.length - 1,
            updateType: "completed",
          });
        }
      }
    } else if (isFailed) {
      triggerMissSound();
      updateMissStatus();
      updateMissRefStatus({ constantLineTime, failKey: inputResult.failKey });
    }
  };
};
