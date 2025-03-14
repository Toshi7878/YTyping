import {
  lineTypingStatusRefAtom,
  typingStatusRefAtom,
  ytStateRefAtom,
} from "@/app/type/atoms/refAtoms";
import {
  comboAtom,
  focusTypingStatusAtoms,
  lineResultsAtom,
  useMapAtom,
  usePlayingInputModeAtom,
  useSceneAtom,
  useSetDisplayLineKpmAtom,
  useSetLineResultsAtom,
  useSetLineWordAtom,
  useSetTypingStatusAtoms,
  useTypePageSpeedAtom,
} from "@/app/type/atoms/stateAtoms";
import { LineWord } from "@/app/type/ts/type";
import { useStore } from "jotai";
import { CreateMap, MISS_PENALTY } from "../../../../../lib/instanceMapData";
import { Typing } from "../../../ts/scene-ts/playing/keydown/typingJudge";
import { useCalcTypeSpeed } from "../../calcTypeSpeed";
import { useGetTime } from "../../useGetTime";
import { useUpdateAllStatus } from "../timer-hooks/replayHooks";
import { useSoundEffect } from "../useSoundEffect";
import { useTypeMiss, useTypeSuccess } from "../useUpdateStatus";

interface HandleTypingParams {
  event: KeyboardEvent;
  count: number;
  lineWord: LineWord;
}

export const useTyping = () => {
  const map = useMapAtom() as CreateMap;
  const inputMode = usePlayingInputModeAtom();
  const scene = useSceneAtom();
  const speed = useTypePageSpeedAtom();
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
  const { setTypingStatus } = useSetTypingStatusAtoms();
  const updateAllStatus = useUpdateAllStatus();

  return ({ event, count, lineWord }: HandleTypingParams) => {
    const typingResult = new Typing({ event, lineWord, inputMode });

    const isSuccess = typingResult.successKey;
    const isFailed = typingResult.newLineWord.correct["r"] || typingResult.newLineWord.correct["k"];
    if (isSuccess) {
      setLineWord(typingResult.newLineWord);
      const isCompleted = !typingResult.newLineWord.nextChar["k"];
      triggerTypingSound({ isCompleted });

      const lineTime = getCurrentLineTime(getCurrentOffsettedYTTime());
      const constantLineTime = getConstantLineTime(lineTime);

      const totalTypeCount = typeAtomStore.get(focusTypingStatusAtoms.type);
      const combo = typeAtomStore.get(comboAtom);
      const typeSpeed = calcTypeSpeed({
        updateType: isCompleted ? "completed" : "keydown",
        constantLineTime,
        totalTypeCount: totalTypeCount,
      });
      updateSuccessStatusRefs({
        constantLineTime,
        isCompleted,
        successKey: typingResult.successKey,
        typeChunk: typingResult.typeChunk,
        combo,
      });
      setDisplayLineKpm(typeSpeed!.lineKpm);
      const newStatus = updateSuccessStatus({
        newLineWord: typingResult.newLineWord,
        lineRemainConstantTime: getConstantRemainLineTime(constantLineTime),
        updatePoint: typingResult.updatePoint,
        totalKpm: typeSpeed!.totalKpm,
        combo,
      });

      const isPaused = typeAtomStore.get(ytStateRefAtom).isPaused;
      if (isCompleted && !isPaused) {
        if (scene === "practice" && speed.playSpeed >= 1) {
          const lineResults = typeAtomStore.get(lineResultsAtom);

          const lResult = lineResults[count - 1];
          const lMiss = typeAtomStore.get(lineTypingStatusRefAtom).miss;

          const lineScore = newStatus.point + newStatus.timeBonus + lMiss * MISS_PENALTY;
          const oldLineScore =
            lResult.status!.p! + lResult.status!.tBonus! + lResult.status!.lMiss! * MISS_PENALTY;

          const isUpdateResult = lineScore >= oldLineScore;
          const newLineResults = [...lineResults];

          if (isUpdateResult) {
            const tTime =
              Math.round(typeAtomStore.get(typingStatusRefAtom).totalTypeTime * 1000) / 1000;

            newLineResults[count - 1] = {
              status: {
                p: newStatus.point,
                tBonus: newStatus.timeBonus,
                lType: typeAtomStore.get(lineTypingStatusRefAtom).type,
                lMiss,
                lRkpm: typeSpeed!.lineRkpm,
                lKpm: typeSpeed!.lineKpm,
                lostW: "",
                lLost: 0,
                combo,
                tTime,
                mode: typeAtomStore.get(lineTypingStatusRefAtom).startInputMode,
                sp: typeAtomStore.get(lineTypingStatusRefAtom).startSpeed,
              },
              typeResult: typeAtomStore.get(lineTypingStatusRefAtom).typeResult,
            };
            setLineResults(newLineResults);
          }

          const newStatusReplay = updateAllStatus({
            count: map!.mapData.length - 1,
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
      const lineTime = getCurrentLineTime(getCurrentOffsettedYTTime());
      const constantLineTime = getConstantLineTime(lineTime);
      updateMissRefStatus({ constantLineTime, failKey: typingResult.failKey });
    }
  };
};
