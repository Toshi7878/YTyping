import { usePlaySpeedStateRef } from "@/app/type/atoms/reducerAtoms";
import { useLineStatusRef, useStatusRef, useYTStatusRef } from "@/app/type/atoms/refAtoms";
import {
  useComboStateRef,
  useLineResultsStateRef,
  useMapStateRef,
  usePlayingInputModeStateRef,
  useSceneStateRef,
  useSetLineKpmState,
  useSetLineResultsState,
  useSetLineWordState,
  useSetTypingStatusState,
  useTypingStatusStateRef,
} from "@/app/type/atoms/stateAtoms";
import { LineWord } from "@/app/type/ts/type";
import { MISS_PENALTY } from "../../../../../lib/instanceMapData";
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

  const { readYTStatusRef } = useYTStatusRef();
  const { readLineStatusRef } = useLineStatusRef();
  const { readStatusRef } = useStatusRef();
  const readTypingStatus = useTypingStatusStateRef();
  const readCombo = useComboStateRef();
  const readLineResults = useLineResultsStateRef();
  const readPlayingInputMode = usePlayingInputModeStateRef();
  const readScene = useSceneStateRef();
  const readPlaySpeed = usePlaySpeedStateRef();
  const readMap = useMapStateRef();

  return ({ event, count, lineWord }: HandleTypingParams) => {
    const map = readMap();

    const typingResult = new Typing({ event, lineWord, inputMode: readPlayingInputMode() });
    const typingStatus = readTypingStatus();

    const isSuccess = typingResult.successKey;
    const isFailed = typingResult.newLineWord.correct["r"] || typingResult.newLineWord.correct["k"];
    if (isSuccess) {
      setLineWord(typingResult.newLineWord);
      const isCompleted = !typingResult.newLineWord.nextChar["k"];
      triggerTypingSound({ isCompleted });

      const lineTime = getCurrentLineTime(getCurrentOffsettedYTTime());
      const constantLineTime = getConstantLineTime(lineTime);

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

      const isPaused = readYTStatusRef().isPaused;
      if (isCompleted && !isPaused) {
        if (readScene() === "practice" && readPlaySpeed().playSpeed >= 1) {
          const lineResults = readLineResults();

          const lResult = lineResults[count - 1];
          const lMiss = readLineStatusRef().miss;

          const lineScore = newStatus.point + newStatus.timeBonus + lMiss * MISS_PENALTY;
          const oldLineScore =
            lResult.status!.p! + lResult.status!.tBonus! + lResult.status!.lMiss! * MISS_PENALTY;

          const isUpdateResult = lineScore >= oldLineScore;
          const newLineResults = [...lineResults];

          if (isUpdateResult) {
            const tTime = Math.round(readStatusRef().totalTypeTime * 1000) / 1000;

            newLineResults[count - 1] = {
              status: {
                p: newStatus.point,
                tBonus: newStatus.timeBonus,
                lType: readLineStatusRef().type,
                lMiss,
                lRkpm: typeSpeed!.lineRkpm,
                lKpm: typeSpeed!.lineKpm,
                lostW: "",
                lLost: 0,
                combo,
                tTime,
                mode: readLineStatusRef().startInputMode,
                sp: readLineStatusRef().startSpeed,
              },
              typeResult: readLineStatusRef().typeResult,
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
      const lineTime = getCurrentLineTime(getCurrentOffsettedYTTime());
      const constantLineTime = getConstantLineTime(lineTime);
      updateMissRefStatus({ constantLineTime, failKey: typingResult.failKey });
    }
  };
};
