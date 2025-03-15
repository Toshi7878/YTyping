import { MISS_PENALTY } from "../../../../lib/instanceMapData";
import { useGameUtilsRef, useLineStatusRef, useStatusRef, useUserStatsRef } from "../../atoms/refAtoms";
import {
  useMapState,
  usePlayingInputModeStateRef,
  useSceneStateRef,
  useSetComboState,
  useSetTypingStatusState,
  useTypingStatusStateRef,
} from "../../atoms/stateAtoms";
import { TypeChunk } from "../../ts/type";

export const useTypeSuccess = () => {
  const map = useMapState();
  const setCombo = useSetComboState();
  const { setTypingStatus } = useSetTypingStatusState();
  const calcCurrentRank = useCalcCurrentRank();

  const { readUserStatsRef, writeUserStatsRef } = useUserStatsRef();
  const { readLineStatusRef, writeLineStatusRef } = useLineStatusRef();
  const { readStatusRef, writeStatusRef } = useStatusRef();
  const readTypingStatus = useTypingStatusStateRef();
  const readPlayingInputMode = usePlayingInputModeStateRef();
  const readScene = useSceneStateRef();

  const updateSuccessStatus = ({ newLineWord, lineRemainConstantTime, updatePoint, totalKpm, combo }) => {
    const status = readTypingStatus();
    const newStatus = { ...status };
    const lineTypeCount = readLineStatusRef().type;

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
      const completeCount = readStatusRef().completeCount;
      const failureCount = readStatusRef().failureCount;

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
    const scene = readScene();
    const lineTypingStatusRef = readLineStatusRef();
    const statusRef = readStatusRef();
    if (lineTypingStatusRef.type === 0) {
      writeLineStatusRef({
        latency: constantLineTime,
      });
    }

    writeStatusRef({
      missCombo: 0,
    });

    const newCombo = combo + 1;
    if (newCombo > statusRef.maxCombo) {
      writeStatusRef({
        maxCombo: newCombo,
      });

      if (scene === "playing") {
        writeUserStatsRef({
          maxCombo: newCombo,
        });
      }
    }

    writeLineStatusRef({
      type: readLineStatusRef().type + 1,
    });

    if (isCompleted) {
      writeLineStatusRef({
        isCompleted: true,
        completedTime: constantLineTime,
      });
      writeStatusRef({
        completeCount: readStatusRef().completeCount + 1,
      });
    }

    if (scene !== "replay") {
      writeLineStatusRef({
        typeResult: [
          ...readLineStatusRef().typeResult,
          {
            c: successKey,
            is: true,
            t: constantLineTime,
          },
        ],
      });
    }

    if (!typeChunk) {
      return;
    }

    const inputMode = readPlayingInputMode();
    if (typeChunk.t === "kana") {
      if (inputMode === "roma") {
        writeUserStatsRef({
          romaType: readUserStatsRef().romaType + 1,
        });
        writeStatusRef({
          romaType: readStatusRef().romaType + 1,
        });
      } else if (inputMode === "kana") {
        writeUserStatsRef({
          kanaType: readUserStatsRef().kanaType + 1,
        });

        writeStatusRef({
          kanaType: readStatusRef().kanaType + 1,
        });
      } else if (inputMode === "flick") {
        writeUserStatsRef({
          flickType: readUserStatsRef().flickType + 1,
        });
        writeStatusRef({
          flickType: readStatusRef().flickType + 1,
        });
      }
    } else if (typeChunk.t === "alphabet") {
      writeUserStatsRef({
        englishType: readUserStatsRef().englishType + 1,
      });
      writeStatusRef({
        englishType: readStatusRef().englishType + 1,
      });
    } else if (typeChunk.t === "num") {
      writeUserStatsRef({
        numType: readUserStatsRef().numType + 1,
      });
      writeStatusRef({
        numType: readStatusRef().numType + 1,
      });
    } else if (typeChunk.t === "space") {
      writeUserStatsRef({
        spaceType: readUserStatsRef().spaceType + 1,
      });
      writeStatusRef({
        spaceType: readStatusRef().spaceType + 1,
      });
    } else if (typeChunk.t === "symbol") {
      writeUserStatsRef({
        symbolType: readUserStatsRef().symbolType + 1,
      });
      writeStatusRef({
        symbolType: readStatusRef().symbolType + 1,
      });
    }
  };

  return { updateSuccessStatus, updateSuccessStatusRefs };
};

export const useCalcCurrentRank = () => {
  const { readGameUtils } = useGameUtilsRef();

  return (currentScore: number) => {
    // 現在のスコアが何番目に入るかを取得
    const { rankingScores } = readGameUtils();
    const rank = rankingScores.findIndex((score) => score <= currentScore);
    return (rank < 0 ? rankingScores.length : rank) + 1;
  };
};

export const useTypeMiss = () => {
  const map = useMapState();
  const setCombo = useSetComboState();
  const { setTypingStatus } = useSetTypingStatusState();

  const { readLineStatusRef, writeLineStatusRef } = useLineStatusRef();
  const { readStatusRef, writeStatusRef } = useStatusRef();
  const readTypingStatus = useTypingStatusStateRef();

  const updateMissStatus = () => {
    const status = readTypingStatus();
    const newStatus = { ...status };

    newStatus.miss++;
    newStatus.point -= MISS_PENALTY;

    setCombo(0);
    setTypingStatus(newStatus);
  };

  const updateMissRefStatus = ({ constantLineTime, failKey }) => {
    writeStatusRef({
      clearRate: readStatusRef().clearRate - map.missRate,
      missCombo: readStatusRef().missCombo + 1,
    });

    writeLineStatusRef({
      miss: readLineStatusRef().miss + 1,
      typeResult: [
        ...readLineStatusRef().typeResult,
        {
          c: failKey,
          t: constantLineTime,
        },
      ],
    });
  };

  return { updateMissStatus, updateMissRefStatus };
};
