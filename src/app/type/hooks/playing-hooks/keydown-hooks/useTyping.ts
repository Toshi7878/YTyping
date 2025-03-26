import { useCountRef, useLineStatusRef, useStatusRef, useYTStatusRef } from "@/app/type/atoms/refAtoms";
import { usePlaySpeedStateRef } from "@/app/type/atoms/speedReducerAtoms";
import {
  useComboStateRef,
  useGameStateUtilsRef,
  useLineResultsStateRef,
  useMapStateRef,
  useSetLineKpmState,
  useSetLineResultsState,
  useSetLineWordState,
  useSetTypingStatusState,
  useTypingStatusStateRef,
} from "@/app/type/atoms/stateAtoms";
import { useInputJudge } from "@/app/type/ts/scene-ts/playing/keydown/typingJudge";
import { MISS_PENALTY } from "../../../../../lib/instanceMapData";
import { useCalcTypeSpeed } from "../../calcTypeSpeed";
import { useGetTime } from "../../useGetTime";
import { useUpdateAllStatus } from "../timer-hooks/replayHooks";
import { useSoundEffect } from "../useSoundEffect";
import { useTypeMiss, useTypeSuccess } from "../useUpdateStatus";

export const useTyping = () => {
  const setLineResults = useSetLineResultsState();
  const { triggerTypingSound, triggerMissSound } = useSoundEffect();

  const setLineWord = useSetLineWordState();
  const { updateSuccessStatus, updateSuccessStatusRefs } = useTypeSuccess();
  const setDisplayLineKpm = useSetLineKpmState();

  const { updateMissStatus, updateMissRefStatus } = useTypeMiss();
  const { getCurrentLineTime, getCurrentOffsettedYTTime, getConstantLineTime, getConstantRemainLineTime } =
    useGetTime();
  const calcTypeSpeed = useCalcTypeSpeed();
  const { setTypingStatus } = useSetTypingStatusState();
  const updateAllStatus = useUpdateAllStatus();

  const { readYTStatus } = useYTStatusRef();
  const { readLineStatus } = useLineStatusRef();
  const { readStatus } = useStatusRef();
  const readTypingStatus = useTypingStatusStateRef();
  const readCombo = useComboStateRef();
  const readLineResults = useLineResultsStateRef();
  const readPlaySpeed = usePlaySpeedStateRef();
  const readMap = useMapStateRef();
  const { readCount } = useCountRef();
  const readGameStateUtils = useGameStateUtilsRef();
  const inputJudge = useInputJudge();

  return (event: KeyboardEvent) => {
    const map = readMap();

    const { isSuccess, isFailed, isCompleted, newLineWord, ...inputResult } = inputJudge(event);
    const constantLineTime = getConstantLineTime(getCurrentLineTime(getCurrentOffsettedYTTime()));

    if (isSuccess) {
      setLineWord(newLineWord);
      triggerTypingSound({ isCompleted });

      const typingStatus = readTypingStatus();
      const totalTypeCount = typingStatus.type;
      const combo = readCombo();
      const typeSpeed = calcTypeSpeed({
        updateType: isCompleted ? "completed" : "keydown",
        constantLineTime,
        totalTypeCount: totalTypeCount,
      });
      updateSuccessStatusRefs({
        constantLineTime,
        isCompleted,
        successKey: inputResult.successKey,
        typeChunk: inputResult.typeChunk,
        combo,
      });
      setDisplayLineKpm(typeSpeed!.lineKpm);
      const newStatus = updateSuccessStatus({
        newLineWord,
        lineRemainConstantTime: getConstantRemainLineTime(constantLineTime),
        updatePoint: inputResult.updatePoint,
        totalKpm: typeSpeed!.totalKpm,
        combo,
      });

      const { isPaused } = readYTStatus();
      const { scene } = readGameStateUtils();
      const { playSpeed } = readPlaySpeed();

      if (isCompleted && !isPaused) {
        if (scene === "practice" && playSpeed >= 1) {
          const lineResultList = readLineResults();
          const count = readCount();

          const lineResult = lineResultList[count - 1];
          const { miss: lineMiss, type: lineType, typeResult, startSpeed, startInputMode } = readLineStatus();

          const lineScore = newStatus.point + newStatus.timeBonus + lineMiss * MISS_PENALTY;
          const oldLineScore =
            lineResult.status!.p! + lineResult.status!.tBonus! + lineResult.status!.lMiss! * MISS_PENALTY;

          const isUpdateResult = lineScore >= oldLineScore;
          const newLineResults = [...lineResultList];

          if (isUpdateResult) {
            const newtotalTypeTime = Math.round(readStatus().totalTypeTime * 1000) / 1000;

            newLineResults[count - 1] = {
              status: {
                p: newStatus.point,
                tBonus: newStatus.timeBonus,
                lType: lineType,
                lMiss: lineMiss,
                lRkpm: typeSpeed!.lineRkpm,
                lKpm: typeSpeed!.lineKpm,
                lostW: "",
                lLost: 0,
                combo,
                tTime: newtotalTypeTime,
                mode: startInputMode,
                sp: startSpeed,
              },
              typeResult,
            };
            setLineResults(newLineResults);
          }

          const newStatusReplay = updateAllStatus({
            count: map.mapData.length - 1,
            newLineResults,
          });

          setTypingStatus({
            ...newStatusReplay,
            point: newStatus.point,
            timeBonus: newStatus.timeBonus,
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
