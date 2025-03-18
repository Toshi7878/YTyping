import { usePlaySpeedReducer } from "@/app/type/atoms/reducerAtoms";
import { useGameUtilsRef, useStatusRef } from "@/app/type/atoms/refAtoms";
import {
  useComboStateRef,
  useLineResultsStateRef,
  useLineWordStateRef,
  useMapStateRef,
  usePlayingInputModeStateRef,
  useSetComboState,
  useSetLineKpmState,
  useSetLineWordState,
  useSetTypingStatusState,
  useTypingStatusStateRef,
} from "@/app/type/atoms/stateAtoms";
import { useCalcTypeSpeed } from "@/app/type/hooks/calcTypeSpeed";
import { useInputModeChange } from "@/app/type/hooks/playing-hooks/useInputModeChange";
import { YouTubeSpeed } from "@/types";
import { KanaInput, RomaInput, TypingKeys } from "../../../ts/scene-ts/playing/keydown/typingJudge";
import { LineResultData, TypeResult } from "../../../ts/type";
import { useGetTime } from "../../useGetTime";
import { useSoundEffect } from "../useSoundEffect";
import { useCalcCurrentRank, useTypeMiss, useTypeSuccess } from "../useUpdateStatus";

export const useUpdateAllStatus = () => {
  const calcCurrentRank = useCalcCurrentRank();
  const readMap = useMapStateRef();

  return ({ count, newLineResults }) => {
    const map = readMap();

    const newStatus = {
      score: 0,
      point: 0,
      timeBonus: 0,
      type: 0,
      miss: 0,
      lost: 0,
      kpm: 0,
      rank: 0,
      line: map.lineLength,
    };

    if (0 >= count) {
      return newStatus;
    }

    for (let i = 0; i <= count - 1; i++) {
      newStatus.score += (newLineResults[i]?.status?.p ?? 0) + (newLineResults[i]?.status?.tBonus ?? 0);
      newStatus.type += newLineResults[i]?.status?.lType ?? 0;
      newStatus.miss += newLineResults[i]?.status?.lMiss ?? 0;
      newStatus.lost += newLineResults[i]?.status?.lLost ?? 0;
      newStatus.line -= newLineResults[i]?.status?.lType != null ? 1 : 0;
    }
    const totalTypeTime = newLineResults[count - 1]?.status?.tTime;
    newStatus.kpm = totalTypeTime ? Math.round((newStatus.type / totalTypeTime!) * 60) : 0;
    newStatus.rank = calcCurrentRank(newStatus.score);

    return newStatus;
  };
};

interface UseKeyReplayProps {
  constantLineTime: number;
  typeData: TypeResult;
  lineResult: LineResultData;
}

const useKeyReplay = () => {
  const setLineWord = useSetLineWordState();
  const setDisplayLineKpm = useSetLineKpmState();
  const setCombo = useSetComboState();
  const { setTypingStatus } = useSetTypingStatusState();

  const inputModeChange = useInputModeChange();
  const dispatchSpeed = usePlaySpeedReducer();
  const { getConstantRemainLineTime } = useGetTime();

  const { updateSuccessStatus, updateSuccessStatusRefs } = useTypeSuccess();

  const { updateMissStatus, updateMissRefStatus } = useTypeMiss();
  const { triggerTypingSound, triggerMissSound } = useSoundEffect();
  const calcTypeSpeed = useCalcTypeSpeed();
  const updateAllStatus = useUpdateAllStatus();

  const { readStatusRef, writeStatusRef } = useStatusRef();
  const readLineResults = useLineResultsStateRef();
  const readCombo = useComboStateRef();
  const readLineWord = useLineWordStateRef();
  const readTypingStatus = useTypingStatusStateRef();
  const readPlayingInputMode = usePlayingInputModeStateRef();

  return ({ constantLineTime, lineResult, typeData }: UseKeyReplayProps) => {
    const key = typeData.c;
    const isSuccess = typeData.is;
    const option = typeData.op;
    const count = readStatusRef().count;

    if (key) {
      const typingKeys: TypingKeys = {
        keys: [key],
        key: key,
        code: `Key${key.toUpperCase()}`,
      };

      if (isSuccess) {
        const lineWord = readLineWord();
        const result =
          readPlayingInputMode() === "roma"
            ? new RomaInput({ typingKeys, lineWord })
            : new KanaInput({ typingKeys, lineWord });
        setLineWord(result.newLineWord);
        const isCompleted = !result.newLineWord.nextChar["k"];
        triggerTypingSound({ isCompleted: isCompleted });

        const lineRemainConstantTime = getConstantRemainLineTime(constantLineTime);

        if (!isCompleted) {
          const totalTypeCount = readTypingStatus().type;

          const typeSpeed = calcTypeSpeed({
            updateType: "keydown",
            constantLineTime,
            totalTypeCount,
          });

          const combo = readCombo();

          updateSuccessStatusRefs({
            constantLineTime,
            isCompleted,
            successKey: result.successKey,
            combo,
          });

          updateSuccessStatus({
            newLineWord: result.newLineWord,
            lineRemainConstantTime,
            updatePoint: result.updatePoint,
            totalKpm: typeSpeed!.totalKpm,
            combo,
          });

          setDisplayLineKpm(typeSpeed!.lineKpm);
        } else {
          const lineResults = readLineResults();
          const newStatusReplay = updateAllStatus({ count, newLineResults: lineResults });
          newStatusReplay.point = lineResult.status!.p as number;
          newStatusReplay.timeBonus = lineResult.status!.tBonus as number;

          setTypingStatus(newStatusReplay);
          setCombo(lineResult.status!.combo as number);
          setDisplayLineKpm(lineResult.status!.lKpm as number);
          writeStatusRef({ totalTypeTime: lineResult.status!.tTime });
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
  const { readStatusRef } = useStatusRef();

  return ({ constantLineTime }: { constantLineTime: number }) => {
    const count = readStatusRef().count;
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
      keyReplay({ constantLineTime: constantLineTime, lineResult, typeData });
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
