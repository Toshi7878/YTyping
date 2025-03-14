import { useStore } from "jotai";
import { CreateMap, MISS_PENALTY } from "../../../../lib/instanceMapData";
import {
  lineTypingStatusRefAtom,
  typingStatusRefAtom,
  userStatsRefAtom,
} from "../../atoms/refAtoms";
import {
  typingStatusAtom,
  useMapAtom,
  usePlayingInputModeAtom,
  useRankingScoresAtom,
  useSceneAtom,
  useSetComboAtom,
  useSetTypingStatusAtoms,
} from "../../atoms/stateAtoms";
import { TypeChunk } from "../../ts/type";

export const useTypeSuccess = () => {
  const map = useMapAtom() as CreateMap;
  const inputMode = usePlayingInputModeAtom();
  const scene = useSceneAtom();
  const setCombo = useSetComboAtom();
  const { setTypingStatus } = useSetTypingStatusAtoms();
  const calcCurrentRank = useCalcCurrentRank();
  const typeAtomStore = useStore();

  const updateSuccessStatus = ({
    newLineWord,
    lineRemainConstantTime,
    updatePoint,
    totalKpm,
    combo,
  }) => {
    const status = typeAtomStore.get(typingStatusAtom);
    const newStatus = { ...status };
    const lineTypeCount = typeAtomStore.get(lineTypingStatusRefAtom).type;

    if (lineTypeCount === 1) {
      newStatus.point = updatePoint;
    } else if (updatePoint > 0) {
      newStatus.point += updatePoint;
    }
    newStatus.kpm = totalKpm;
    newStatus.type++;

    const isCompleted = !newLineWord.nextChar["k"];
    if (isCompleted) {
      const timeBonus = Math.round(lineRemainConstantTime * 1 * 100);
      newStatus.timeBonus = timeBonus; //speed;
      newStatus.score += newStatus.point + timeBonus;
      const completeCount = typeAtomStore.get(typingStatusRefAtom).completeCount;
      const failureCount = typeAtomStore.get(typingStatusRefAtom).failureCount;

      newStatus.line = map.lineLength - (completeCount + failureCount);

      newStatus.rank = calcCurrentRank(newStatus.score);
    }

    setTypingStatus(newStatus);
    setCombo(combo + 1);

    return newStatus;
  };

  const updateSuccessStatusRefs = ({
    constantLineTime,
    isCompleted,
    typeChunk,
    successKey,
    combo,
  }: {
    constantLineTime: number;
    isCompleted: boolean;
    typeChunk?: TypeChunk;
    successKey: string;
    combo: number;
  }) => {
    const lineTypingStatusRef = typeAtomStore.get(lineTypingStatusRefAtom);
    const typingStatusRef = typeAtomStore.get(typingStatusRefAtom);
    if (lineTypingStatusRef.type === 0) {
      typeAtomStore.set(lineTypingStatusRefAtom, (prev) => ({
        ...prev,
        latency: constantLineTime,
      }));
    }

    typeAtomStore.set(typingStatusRefAtom, (prev) => ({
      ...prev,
      missCombo: 0,
    }));

    const newCombo = combo + 1;
    if (newCombo > typingStatusRef.maxCombo) {
      typeAtomStore.set(typingStatusRefAtom, (prev) => ({
        ...prev,
        maxCombo: newCombo,
      }));
      if (scene === "playing") {
        typeAtomStore.set(userStatsRefAtom, (prev) => ({
          ...prev,
          maxCombo: newCombo,
        }));
      }
    }

    typeAtomStore.set(lineTypingStatusRefAtom, (prev) => ({
      ...prev,
      type: prev.type + 1,
    }));

    if (isCompleted) {
      typeAtomStore.set(lineTypingStatusRefAtom, (prev) => ({
        ...prev,
        isCompleted: true,
        completedTime: constantLineTime,
      }));
      typeAtomStore.set(typingStatusRefAtom, (prev) => ({
        ...prev,
        completeCount: prev.completeCount + 1,
      }));
    }

    if (scene !== "replay") {
      typeAtomStore.set(lineTypingStatusRefAtom, (prev) => ({
        ...prev,
        typeResult: [
          ...prev.typeResult,
          {
            c: successKey,
            is: true,
            t: constantLineTime,
          },
        ],
      }));
    }

    if (!typeChunk) {
      return;
    }

    if (typeChunk.t === "kana") {
      if (inputMode === "roma") {
        typeAtomStore.set(userStatsRefAtom, (prev) => ({ ...prev, romaType: prev.romaType + 1 }));
        typeAtomStore.set(typingStatusRefAtom, (prev) => ({
          ...prev,
          romaType: prev.romaType + 1,
        }));
      } else if (inputMode === "kana") {
        typeAtomStore.set(userStatsRefAtom, (prev) => ({ ...prev, kanaType: prev.kanaType + 1 }));
        typeAtomStore.set(typingStatusRefAtom, (prev) => ({
          ...prev,
          kanaType: prev.kanaType + 1,
        }));
      } else if (inputMode === "flick") {
        typeAtomStore.set(userStatsRefAtom, (prev) => ({ ...prev, flickType: prev.flickType + 1 }));
        typeAtomStore.set(typingStatusRefAtom, (prev) => ({
          ...prev,
          flickType: prev.flickType + 1,
        }));
      }
    } else if (typeChunk.t === "alphabet") {
      typeAtomStore.set(userStatsRefAtom, (prev) => ({
        ...prev,
        englishType: prev.englishType + 1,
      }));
      typeAtomStore.set(typingStatusRefAtom, (prev) => ({
        ...prev,
        englishType: prev.englishType + 1,
      }));
    } else if (typeChunk.t === "num") {
      typeAtomStore.set(userStatsRefAtom, (prev) => ({
        ...prev,
        numType: prev.numType + 1,
      }));
      typeAtomStore.set(typingStatusRefAtom, (prev) => ({
        ...prev,
        numType: prev.numType + 1,
      }));
    } else if (typeChunk.t === "space") {
      typeAtomStore.set(userStatsRefAtom, (prev) => ({
        ...prev,
        spaceType: prev.spaceType + 1,
      }));
      typeAtomStore.set(typingStatusRefAtom, (prev) => ({
        ...prev,
        spaceType: prev.spaceType + 1,
      }));
    } else if (typeChunk.t === "symbol") {
      typeAtomStore.set(userStatsRefAtom, (prev) => ({
        ...prev,
        symbolType: prev.symbolType + 1,
      }));
      typeAtomStore.set(typingStatusRefAtom, (prev) => ({
        ...prev,
        symbolType: prev.symbolType + 1,
      }));
    }
  };

  return { updateSuccessStatus, updateSuccessStatusRefs };
};

export const useCalcCurrentRank = () => {
  const rankingScores = useRankingScoresAtom();

  return (currentScore: number) => {
    // 現在のスコアが何番目に入るかを取得
    const rank = rankingScores.findIndex((score) => score <= currentScore);
    return (rank < 0 ? rankingScores.length : rank) + 1;
  };
};

export const useTypeMiss = () => {
  const map = useMapAtom() as CreateMap;
  const setCombo = useSetComboAtom();
  const { setTypingStatus } = useSetTypingStatusAtoms();
  const typeAtomStore = useStore();

  const updateMissStatus = () => {
    const status = typeAtomStore.get(typingStatusAtom);
    const newStatus = { ...status };

    newStatus.miss++;
    newStatus.point -= MISS_PENALTY;

    setCombo(0);
    setTypingStatus(newStatus);
  };

  const updateMissRefStatus = ({ constantLineTime, failKey }) => {
    typeAtomStore.set(typingStatusRefAtom, (prev) => ({
      ...prev,
      clearRate: prev.clearRate - map.missRate,
      missCombo: prev.missCombo++,
    }));

    typeAtomStore.set(lineTypingStatusRefAtom, (prev) => ({
      ...prev,
      miss: prev.miss + 1,
      typeResult: [
        ...prev.typeResult,
        {
          c: failKey,
          t: constantLineTime,
        },
      ],
    }));
  };

  return { updateMissStatus, updateMissRefStatus };
};
