import {
  comboAtom,
  lineResultsAtom,
  lineWordAtom,
  playingInputModeAtom,
  sceneAtom,
  speedAtom,
  statusAtoms,
  useMapAtom,
  useSetDisplayLineKpmAtom,
  useSetLineResultsAtom,
  useSetLineWordAtom,
  useSetStatusAtoms,
} from "@/app/type/type-atoms/gameRenderAtoms";
import { useRefs } from "@/app/type/type-contexts/refsProvider";
import { useStore } from "jotai";
import { CreateMap, MISS_PENALTY } from "../../../../../lib/instanceMapData";
import { useCalcTypeSpeed } from "../../../ts/scene-ts/playing/calcTypeSpeed";
import { Typing } from "../../../ts/scene-ts/playing/keydown/typingJudge";
import { useGetTime } from "../../useGetTime";
import { useUpdateAllStatus } from "../timer-hooks/replayHooks";
import { useSoundEffect } from "../useSoundEffect";
import { useTypeMiss, useTypeSuccess } from "../useUpdateStatus";

interface HandleTypingParams {
  event: KeyboardEvent;
  count: number;
}

export const useTyping = () => {
  const { statusRef, ytStateRef } = useRefs();

  const map = useMapAtom() as CreateMap;
  const typeAtomStore = useStore();

  const setLineResults = useSetLineResultsAtom();
  const { triggerTypingSound, triggerMissSound } = useSoundEffect();

  const setLineWord = useSetLineWordAtom();
  const { updateSuccessStatus, updateSuccessStatusRefs } = useTypeSuccess();
  const setDisplayLineKpm = useSetDisplayLineKpmAtom();

  const { updateMissStatus, updateMissRefStatus } = useTypeMiss();
  const {
    getCurrentLineTime,
    getCurrentOffsettedYTTime,
    getConstantLineTime,
    getConstantRemainLineTime,
  } = useGetTime();
  const calcTypeSpeed = useCalcTypeSpeed();
  const { setStatusValues } = useSetStatusAtoms();
  const updateAllStatus = useUpdateAllStatus();

  return ({ event, count }: HandleTypingParams) => {
    const lineWord = typeAtomStore.get(lineWordAtom);
    const inputMode = typeAtomStore.get(playingInputModeAtom);

    const lineTime = getCurrentLineTime(getCurrentOffsettedYTTime());
    const constantLineTime = getConstantLineTime(lineTime);

    const typingResult = new Typing({ event, lineWord, inputMode });

    if (typingResult.successKey) {
      const isLineCompleted = !typingResult.newLineWord.nextChar["k"];
      const totalTypeCount = typeAtomStore.get(statusAtoms.type);

      const typeSpeed = calcTypeSpeed({
        updateType: isLineCompleted ? "completed" : "keydown",
        constantLineTime,
        totalTypeCount: totalTypeCount,
      });

      updateSuccessStatusRefs({
        constantLineTime,
        newLineWord: typingResult.newLineWord,
        successKey: typingResult.successKey,
      });

      setDisplayLineKpm(typeSpeed!.lineKpm);
      setLineWord(typingResult.newLineWord);

      const newStatus = updateSuccessStatus({
        newLineWord: typingResult.newLineWord,
        lineRemainConstantTime: getConstantRemainLineTime(constantLineTime),
        updatePoint: typingResult.updatePoint,
        totalKpm: typeSpeed!.totalKpm,
      });

      triggerTypingSound({ isLineCompleted });

      const playSpeed = typeAtomStore.get(speedAtom).playSpeed;
      const scene = typeAtomStore.get(sceneAtom);

      const isPaused = ytStateRef.current?.isPaused;
      if (scene === "practice" && playSpeed >= 1 && !isPaused && isLineCompleted) {
        const lineResults = typeAtomStore.get(lineResultsAtom);

        const lResult = lineResults[count - 1];
        const lMiss = statusRef.current!.lineStatus.lineMiss;

        const lineScore = newStatus.point + newStatus.timeBonus + lMiss * MISS_PENALTY;
        const oldLineScore =
          lResult.status!.p! + lResult.status!.tBonus! + lResult.status!.lMiss! * MISS_PENALTY;

        const isUpdateResult = lineScore >= oldLineScore;
        const newLineResults = [...lineResults];

        if (isUpdateResult) {
          const tTime = Math.round(statusRef.current!.status.totalTypeTime * 1000) / 1000;
          const mode = statusRef.current!.lineStatus.lineStartInputMode;
          const sp = statusRef.current!.lineStatus.lineStartSpeed;
          const typeResult = statusRef.current!.lineStatus.typeResult;
          const combo = typeAtomStore.get(comboAtom);

          newLineResults[count - 1] = {
            status: {
              p: newStatus.point,
              tBonus: newStatus.timeBonus,
              lType: statusRef.current!.lineStatus.lineType,
              lMiss,
              lRkpm: typeSpeed?.lineRkpm || 0,
              lKpm: typeSpeed!.lineKpm,
              lostW: "",
              lLost: 0,
              combo,
              tTime,
              mode,
              sp,
            },
            typeResult,
          };
          setLineResults(newLineResults);
        }

        const newStatusReplay = updateAllStatus({
          count: map!.mapData.length - 1,
          newLineResults,
        });

        setStatusValues({
          ...newStatusReplay,
          point: newStatus.point,
          timeBonus: newStatus.timeBonus,
        });
      }
    } else if (typingResult.newLineWord.correct["r"] || typingResult.newLineWord.correct["k"]) {
      updateMissStatus();
      updateMissRefStatus({ constantLineTime, failKey: typingResult.failKey });

      triggerMissSound();
    }
  };
};
