import { useGameRef, useStatusRef } from "@/app/type/atoms/refAtoms";
import {
  comboAtom,
  focusTypingStatusAtoms,
  lineResultsAtom,
  lineWordAtom,
  typingStatusAtom,
  useMapAtom,
  usePlayingInputModeAtom,
  useSetComboAtom,
  useSetDisplayLineKpmAtom,
  useSetLineWordAtom,
  useSetTypingStatusAtoms,
} from "@/app/type/atoms/stateAtoms";
import { useCalcTypeSpeed } from "@/app/type/hooks/calcTypeSpeed";
import { useInputModeChange } from "@/app/type/hooks/playing-hooks/useInputModeChange";
import { useVideoSpeedChange } from "@/app/type/hooks/useVideoSpeedChange";
import { useStore } from "jotai";
import { CreateMap } from "../../../../../lib/instanceMapData";
import { KanaInput, RomaInput, TypingKeys } from "../../../ts/scene-ts/playing/keydown/typingJudge";
import { LineResultData, TypeResult } from "../../../ts/type";
import { useGetTime } from "../../useGetTime";
import { useSoundEffect } from "../useSoundEffect";
import { useCalcCurrentRank, useTypeMiss, useTypeSuccess } from "../useUpdateStatus";

export const useUpdateAllStatus = () => {
  const map = useMapAtom() as CreateMap;
  const calcCurrentRank = useCalcCurrentRank();

  return ({ count, newLineResults }) => {
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
      newStatus.score +=
        (newLineResults[i]?.status?.p ?? 0) + (newLineResults[i]?.status?.tBonus ?? 0);
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
  const inputMode = usePlayingInputModeAtom();

  const typeAtomStore = useStore();

  const setLineWord = useSetLineWordAtom();
  const setDisplayLineKpm = useSetDisplayLineKpmAtom();
  const setCombo = useSetComboAtom();
  const { setTypingStatus } = useSetTypingStatusAtoms();

  const inputModeChange = useInputModeChange();
  const { playingSpeedChange } = useVideoSpeedChange();
  const { getConstantRemainLineTime } = useGetTime();

  const { updateSuccessStatus, updateSuccessStatusRefs } = useTypeSuccess();

  const { updateMissStatus, updateMissRefStatus } = useTypeMiss();
  const { triggerTypingSound, triggerMissSound } = useSoundEffect();
  const calcTypeSpeed = useCalcTypeSpeed();
  const updateAllStatus = useUpdateAllStatus();

  const { readStatusRef } = useStatusRef();
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
        const lineWord = typeAtomStore.get(lineWordAtom);
        const result =
          inputMode === "roma"
            ? new RomaInput({ typingKeys, lineWord })
            : new KanaInput({ typingKeys, lineWord });
        setLineWord(result.newLineWord);
        const isCompleted = !result.newLineWord.nextChar["k"];
        triggerTypingSound({ isCompleted: isCompleted });

        const lineRemainConstantTime = getConstantRemainLineTime(constantLineTime);

        if (!isCompleted) {
          const totalTypeCount = typeAtomStore.get(focusTypingStatusAtoms.type);

          const typeSpeed = calcTypeSpeed({
            updateType: "keydown",
            constantLineTime,
            totalTypeCount,
          });

          const combo = typeAtomStore.get(comboAtom);

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
          const lineResults = typeAtomStore.get(lineResultsAtom);
          const newStatusReplay = updateAllStatus({ count, newLineResults: lineResults });
          newStatusReplay.point = lineResult.status!.p as number;
          newStatusReplay.timeBonus = lineResult.status!.tBonus as number;
          setTypingStatus(newStatusReplay);
          setCombo(lineResult.status!.combo as number);
          setDisplayLineKpm(lineResult.status!.lKpm as number);
          typeAtomStore.set(typingStatusAtom, (prev) => ({
            ...prev,
            totalTypeTime: lineResult.status!.tTime,
          }));
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
          playingSpeedChange();
          break;
      }
    }
  };
};

export const useReplay = () => {
  const keyReplay = useKeyReplay();
  const typeAtomStore = useStore();

  const { readGameRef, writeGameRef } = useGameRef();
  const { readStatusRef } = useStatusRef();

  return ({ constantLineTime }: { constantLineTime: number }) => {
    const count = readStatusRef().count;
    const lineResults = typeAtomStore.get(lineResultsAtom);

    const lineResult: LineResultData = lineResults[count - 1];
    const typeResults = lineResult.typeResult;

    if (typeResults.length === 0) {
      return;
    }
    const replayKeyCount = readGameRef().replayKeyCount;
    const typeData = typeResults[replayKeyCount];

    if (!typeData) {
      return;
    }

    const keyTime = typeData.t;

    if (constantLineTime >= keyTime) {
      keyReplay({ constantLineTime: constantLineTime, lineResult, typeData });
      writeGameRef({ replayKeyCount: replayKeyCount + 1 });
    }
  };
};

export const useLineReplayUpdate = () => {
  const typeAtomStore = useStore();

  const { playingSpeedChange } = useVideoSpeedChange();
  const inputModeChange = useInputModeChange();

  const { writeGameRef } = useGameRef();

  return (newCount: number) => {
    const lineResults = typeAtomStore.get(lineResultsAtom);

    const lineResult = lineResults[newCount];
    const lineInputMode = lineResult.status!.mode;
    const speed = lineResult.status!.sp;

    inputModeChange(lineInputMode);
    playingSpeedChange("set", speed);
    writeGameRef({ replayKeyCount: 0 });
  };
};
