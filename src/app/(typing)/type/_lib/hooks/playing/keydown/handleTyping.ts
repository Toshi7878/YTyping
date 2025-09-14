import {
  useReadGameUtilParams,
  useReadMap,
  useSetCurrentLine,
  useSetLineWord,
} from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { useInputJudge } from "@/app/(typing)/type/_lib/hooks/playing/keydown/typingJudge";
import { useLineCount, useReadYTStatus } from "../../../atoms/refAtoms";
import { useCalcTypeSpeed } from "../calcTypeSpeed";
import { useGetTime } from "../getYTTime";
import { useSoundEffect } from "../soundEffect";
import { useUpdateLineResult } from "../updateLineResult";
import { useTypeMiss, useTypeSuccess, useUpdateAllStatus } from "../updateStatus";

export const useTyping = () => {
  const { triggerTypingSound, triggerMissSound } = useSoundEffect();

  const setLineWord = useSetLineWord();
  const { updateSuccessStatus, updateSuccessStatusRefs } = useTypeSuccess();

  const { updateMissStatus, updateMissRefStatus } = useTypeMiss();
  const { getCurrentLineTime, getCurrentOffsettedYTTime, getConstantLineTime, getConstantRemainLineTime } =
    useGetTime();
  const { readYTStatus } = useReadYTStatus();

  const calcTypeSpeed = useCalcTypeSpeed();
  const inputJudge = useInputJudge();
  const { isLinePointUpdated, updateLineResult } = useUpdateLineResult();
  const readGameStateUtils = useReadGameUtilParams();
  const updateAllStatus = useUpdateAllStatus();
  const readMap = useReadMap();
  const { readCount } = useLineCount();
  const { setCurrentLine } = useSetCurrentLine();

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
      const { isPaused } = readYTStatus();

      if (!isPaused) {
        calcTypeSpeed({
          updateType: isCompleted ? "completed" : "keydown",
          constantLineTime,
        });
      }

      if (isCompleted) {
        if (isLinePointUpdated()) {
          updateLineResult();
        }

        const { scene } = readGameStateUtils();
        if (scene === "practice") {
          const map = readMap();
          if (!map) return;

          updateAllStatus({
            count: map.mapData.length - 1,
            updateType: "completed",
          });

          if (isPaused) {
            const count = readCount();
            const newCurrentLine = map.mapData[count - 1];
            const newNextLine = map.mapData[count];
            setCurrentLine({ newCurrentLine, newNextLine });
          }
        }
      }
    } else if (isFailed) {
      triggerMissSound();
      updateMissStatus();
      updateMissRefStatus({ constantLineTime, failKey: inputResult.failKey });
    }
  };
};
