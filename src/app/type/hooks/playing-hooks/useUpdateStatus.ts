import { MISS_PENALTY } from "../../../../lib/instanceMapData";
import { useGameUtilsRef, useLineStatusRef, useStatusRef, useUserStatsRef } from "../../atoms/refAtoms";
import {
  useMapStateRef,
  usePlayingInputModeStateRef,
  useSceneStateRef,
  useSetComboState,
  useSetTypingStatusState,
  useTypingStatusStateRef,
} from "../../atoms/stateAtoms";
import { TypeChunk } from "../../ts/type";

export const useTypeSuccess = () => {
  const setCombo = useSetComboState();
  const { setTypingStatus } = useSetTypingStatusState();
  const calcCurrentRank = useCalcCurrentRank();

  const { readUserStats, writeUserStats } = useUserStatsRef();
  const { readLineStatus, writeLineStatus } = useLineStatusRef();
  const { readStatus, writeStatus } = useStatusRef();
  const readTypingStatus = useTypingStatusStateRef();
  const readPlayingInputMode = usePlayingInputModeStateRef();
  const readScene = useSceneStateRef();
  const readMap = useMapStateRef();

  const updateSuccessStatus = ({ newLineWord, lineRemainConstantTime, updatePoint, totalKpm, combo }) => {
    const map = readMap();
    const status = readTypingStatus();
    const newStatus = { ...status };
    const lineTypeCount = readLineStatus().type;

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
      const { completeCount, failureCount } = readStatus();

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
    const lineTypingStatusRef = readLineStatus();
    const { maxCombo, completeCount } = readStatus();
    if (lineTypingStatusRef.type === 0) {
      writeLineStatus({
        latency: constantLineTime,
      });
    }

    writeStatus({
      missCombo: 0,
    });

    const newCombo = combo + 1;
    if (newCombo > maxCombo) {
      writeStatus({
        maxCombo: newCombo,
      });

      if (scene === "playing") {
        writeUserStats({
          maxCombo: newCombo,
        });
      }
    }

    writeLineStatus({
      type: readLineStatus().type + 1,
    });

    if (isCompleted) {
      writeLineStatus({
        isCompleted: true,
        completedTime: constantLineTime,
      });
      writeStatus({
        completeCount: completeCount + 1,
      });
    }

    if (scene !== "replay") {
      writeLineStatus({
        typeResult: [
          ...readLineStatus().typeResult,
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
        writeUserStats({
          romaType: readUserStats().romaType + 1,
        });
        writeStatus({
          romaType: readStatus().romaType + 1,
        });
      } else if (inputMode === "kana") {
        writeUserStats({
          kanaType: readUserStats().kanaType + 1,
        });

        writeStatus({
          kanaType: readStatus().kanaType + 1,
        });
      } else if (inputMode === "flick") {
        writeUserStats({
          flickType: readUserStats().flickType + 1,
        });
        writeStatus({
          flickType: readStatus().flickType + 1,
        });
      }
    } else if (typeChunk.t === "alphabet") {
      writeUserStats({
        englishType: readUserStats().englishType + 1,
      });
      writeStatus({
        englishType: readStatus().englishType + 1,
      });
    } else if (typeChunk.t === "num") {
      writeUserStats({
        numType: readUserStats().numType + 1,
      });
      writeStatus({
        numType: readStatus().numType + 1,
      });
    } else if (typeChunk.t === "space") {
      writeUserStats({
        spaceType: readUserStats().spaceType + 1,
      });
      writeStatus({
        spaceType: readStatus().spaceType + 1,
      });
    } else if (typeChunk.t === "symbol") {
      writeUserStats({
        symbolType: readUserStats().symbolType + 1,
      });
      writeStatus({
        symbolType: readStatus().symbolType + 1,
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
  const setCombo = useSetComboState();
  const { setTypingStatus } = useSetTypingStatusState();

  const { readLineStatus, writeLineStatus } = useLineStatusRef();
  const { readStatus, writeStatus } = useStatusRef();
  const readTypingStatus = useTypingStatusStateRef();
  const readMap = useMapStateRef();

  const updateMissStatus = () => {
    const status = readTypingStatus();
    const newStatus = { ...status };

    newStatus.miss++;
    newStatus.point -= MISS_PENALTY;

    setCombo(0);
    setTypingStatus(newStatus);
  };

  const updateMissRefStatus = ({ constantLineTime, failKey }) => {
    const map = readMap();

    writeStatus({
      clearRate: readStatus().clearRate - map.missRate,
      missCombo: readStatus().missCombo + 1,
    });

    writeLineStatus({
      miss: readLineStatus().miss + 1,
      typeResult: [
        ...readLineStatus().typeResult,
        {
          c: failKey,
          t: constantLineTime,
        },
      ],
    });
  };

  return { updateMissStatus, updateMissRefStatus };
};
