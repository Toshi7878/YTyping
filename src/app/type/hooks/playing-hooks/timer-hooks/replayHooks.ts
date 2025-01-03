import { useInputModeChange } from "@/app/type/hooks/playing-hooks/useInputModeChange";
import { useVideoSpeedChange } from "@/app/type/hooks/useVideoSpeedChange";
import { useCalcTypeSpeed } from "@/app/type/ts/scene-ts/playing/calcTypeSpeed";
import {
  lineResultsAtom,
  lineWordAtom,
  playingInputModeAtom,
  useMapAtom,
  useSetComboAtom,
  useSetDisplayLineKpmAtom,
  useSetLineWordAtom,
  useSetStatusAtoms,
  useStatusAtomsValues,
} from "@/app/type/type-atoms/gameRenderAtoms";
import { useRefs } from "@/app/type/type-contexts/refsProvider";
import { useStore } from "jotai";
import { CreateMap } from "../../../../../lib/instanceMapData";
import { CharsType, KanaInput, RomaInput } from "../../../ts/scene-ts/playing/keydown/typingJudge";
import { LineResultData, Status, TypeResult } from "../../../ts/type";
import { useGetTime } from "../../useGetTime";
import { useSoundEffect } from "../useSoundEffect";
import { useCalcCurrentRank, useTypeMiss, useTypeSuccess } from "../useUpdateStatus";

export const useUpdateAllStatus = () => {
  const map = useMapAtom() as CreateMap;
  const calcCurrentRank = useCalcCurrentRank();

  return ({ count, newLineResults }) => {
    const newStatus: Status = {
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
        (newLineResults[i].status?.p ?? 0) + (newLineResults[i].status?.tBonus ?? 0);
      newStatus.type += newLineResults[i].status?.lType ?? 0;
      newStatus.miss += newLineResults[i].status?.lMiss ?? 0;
      newStatus.lost += newLineResults[i].status?.lLost ?? 0;
      newStatus.line -= newLineResults[i].status?.lType != null ? 1 : 0;
    }
    const totalTypeTime = newLineResults[count - 1].status?.tTime;
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
  const { statusRef } = useRefs();
  const typeAtomStore = useStore();

  const setLineWord = useSetLineWordAtom();
  const setDisplayLineKpm = useSetDisplayLineKpmAtom();
  const setCombo = useSetComboAtom();
  const { setStatusValues } = useSetStatusAtoms();

  const inputModeChange = useInputModeChange();
  const { playingSpeedChange } = useVideoSpeedChange();
  const { getConstantRemainLineTime } = useGetTime();

  const { updateSuccessStatus, updateSuccessStatusRefs } = useTypeSuccess();

  const { updateMissStatus, updateMissRefStatus } = useTypeMiss();
  const { triggerTypingSound, triggerMissSound } = useSoundEffect();
  const calcTypeSpeed = useCalcTypeSpeed();
  const statusAtomsValues = useStatusAtomsValues();
  const updateAllStatus = useUpdateAllStatus();

  return ({ constantLineTime, lineResult, typeData }: UseKeyReplayProps) => {
    const key = typeData.c;
    const isSuccess = typeData.is;
    const option = typeData.op;
    const count = statusRef.current!.status.count;

    if (key) {
      const chars: CharsType = {
        keys: [key],
        key: key,
        code: `Key${key.toUpperCase()}`,
      };

      const status = statusAtomsValues();

      if (isSuccess) {
        const inputMode = typeAtomStore.get(playingInputModeAtom);
        const lineWord = typeAtomStore.get(lineWordAtom);
        const result =
          inputMode === "roma"
            ? new RomaInput({ chars, lineWord })
            : new KanaInput({ chars, lineWord });
        setLineWord({ ...result.newLineWord });
        const isLineCompleted = !result.newLineWord.nextChar["k"];
        triggerTypingSound({ isLineCompleted });

        const lineRemainConstantTime = getConstantRemainLineTime(constantLineTime);

        if (isLineCompleted) {
          const typeSpeed = calcTypeSpeed({
            updateType: "keydown",
            constantLineTime,
            totalTypeCount: status.type,
          });

          updateSuccessStatusRefs({
            constantLineTime,
            newLineWord: result.newLineWord,
            successKey: result.successKey,
          });

          updateSuccessStatus({
            newLineWord: result.newLineWord,
            lineRemainConstantTime,
            updatePoint: result.updatePoint,
            totalKpm: typeSpeed!.totalKpm,
          });

          setDisplayLineKpm(typeSpeed!.lineKpm);
        } else {
          const lineResults = typeAtomStore.get(lineResultsAtom);
          const newStatusReplay = updateAllStatus({ count, newLineResults: lineResults });
          newStatusReplay.point = lineResult.status!.p as number;
          newStatusReplay.timeBonus = lineResult.status!.tBonus as number;
          setStatusValues(newStatusReplay);
          setCombo(lineResult.status!.combo as number);
          setDisplayLineKpm(lineResult.status!.lKpm as number);
          statusRef.current!.status.totalTypeTime = lineResult.status!.tTime;
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
  const { gameStateRef, statusRef } = useRefs();
  const keyReplay = useKeyReplay();
  const typeAtomStore = useStore();

  return ({ constantLineTime }: { constantLineTime: number }) => {
    const count = statusRef.current!.status.count;
    const lineResults = typeAtomStore.get(lineResultsAtom);

    const lineResult: LineResultData = lineResults[count - 1];
    const typeResults = lineResult.typeResult;

    if (typeResults.length === 0) {
      return;
    }
    const keyCount = gameStateRef.current!.replay.replayKeyCount!;

    const typeData = typeResults[keyCount];

    if (!typeData) {
      return;
    }

    const keyTime = typeData.t;

    if (constantLineTime >= keyTime) {
      keyReplay({ constantLineTime: constantLineTime, lineResult, typeData });
      gameStateRef.current!.replay.replayKeyCount++;
    }
  };
};

export const useLineReplayUpdate = () => {
  const { gameStateRef } = useRefs();
  const typeAtomStore = useStore();

  const { playingSpeedChange } = useVideoSpeedChange();
  const inputModeChange = useInputModeChange();

  return (newCount: number) => {
    const lineResults = typeAtomStore.get(lineResultsAtom);

    const lineResult = lineResults[newCount];
    const lineInputMode = lineResult.status!.mode;
    const speed = lineResult.status!.sp;

    inputModeChange(lineInputMode);
    playingSpeedChange("set", speed);

    gameStateRef.current!.replay.replayKeyCount = 0;
  };
};
