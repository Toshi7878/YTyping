import { MISS_PENALTY } from "../../../../lib/instanceMapData";
import { useGameUtilsRef, useLineStatusRef, useStatusRef, useUserStatsRef } from "../../atoms/refAtoms";
import {
  useComboStateRef,
  useGameStateUtilsRef,
  useLineWordStateRef,
  useMapStateRef,
  useSetComboState,
  useSetTypingStatusState,
  useTypingStatusStateRef,
} from "../../atoms/stateAtoms";
import { NextTypeChunk } from "../../ts/type";

export const useTypeSuccess = () => {
  const setCombo = useSetComboState();
  const { setTypingStatus } = useSetTypingStatusState();
  const calcCurrentRank = useCalcCurrentRank();

  const { readUserStats, writeUserStats } = useUserStatsRef();
  const { readLineStatus, writeLineStatus } = useLineStatusRef();
  const { readStatus, writeStatus } = useStatusRef();
  const readTypingStatus = useTypingStatusStateRef();
  const readGameStateUtils = useGameStateUtilsRef();

  const readMap = useMapStateRef();
  const readCombo = useComboStateRef();

  const updateSuccessStatus = ({ isCompleted, lineRemainConstantTime, updatePoint }) => {
    const newStatus = readTypingStatus();
    const lineTypeCount = readLineStatus().type;

    if (lineTypeCount === 1) {
      newStatus.point = updatePoint;
    } else if (updatePoint > 0) {
      newStatus.point += updatePoint;
    }
    newStatus.type++;

    if (isCompleted) {
      const timeBonus = Math.floor(lineRemainConstantTime * 100);
      newStatus.timeBonus = timeBonus;
      newStatus.score += newStatus.point + timeBonus;
      const { completeCount, failureCount } = readStatus();

      newStatus.line = readMap().lineLength - (completeCount + failureCount);

      newStatus.rank = calcCurrentRank(newStatus.score);
    }

    setTypingStatus(newStatus);
    setCombo((prev) => prev + 1);
  };

  const updateSuccessStatusRefs = ({
    constantLineTime,
    isCompleted,
    typeChunk,
    successKey,
  }: {
    constantLineTime: number;
    isCompleted: boolean;
    typeChunk?: NextTypeChunk;
    successKey: string;
  }) => {
    const { scene } = readGameStateUtils();
    const lineTypingStatusRef = readLineStatus();
    const { maxCombo, completeCount } = readStatus();
    if (lineTypingStatusRef.type === 0) {
      writeLineStatus({
        latency: constantLineTime,
      });

      const { totalLatency } = readStatus();
      writeStatus({
        totalLatency: totalLatency + constantLineTime,
      });
    }

    writeStatus({
      missCombo: 0,
    });

    const newCombo = readCombo() + 1;
    if (scene === "playing") {
      if (newCombo > maxCombo) {
        writeStatus({
          maxCombo: newCombo,
        });

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

    if (scene !== "replay" && typeChunk) {
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

      const { inputMode } = readGameStateUtils();
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

export const useLineUpdateStatus = () => {
  const calcCurrentRank = useCalcCurrentRank();
  const { setTypingStatus } = useSetTypingStatusState();
  const { readStatus, writeStatus } = useStatusRef();
  const readTypingStatus = useTypingStatusStateRef();
  const readGameStateUtils = useGameStateUtilsRef();
  const readMap = useMapStateRef();
  const readLineWord = useLineWordStateRef();
  const { readLineStatus } = useLineStatusRef();
  return ({ constantLineTime }: { constantLineTime: number }) => {
    const map = readMap();
    const newStatus = readTypingStatus();
    const { scene } = readGameStateUtils();
    const lineWord = readLineWord();

    if (scene === "playing") {
      const { kanaToRomaConvertCount } = readStatus();

      writeStatus({
        kanaToRomaConvertCount: kanaToRomaConvertCount + lineWord.correct.r.length,
      });
    }

    const isFailured = lineWord.nextChar["k"];
    if (isFailured) {
      const { failureCount, completeCount } = readStatus();

      const newFailureCount = failureCount + 1;

      writeStatus({
        failureCount: newFailureCount,
      });

      newStatus.line = map.lineLength - (completeCount + newFailureCount);
      newStatus.score += newStatus.point;
      newStatus.rank = calcCurrentRank(newStatus.score);

      const { totalLatency } = readStatus();
      const { type: lineType } = readLineStatus();

      writeStatus({
        totalLatency: lineType === 0 ? totalLatency + constantLineTime : totalLatency,
      });
    }

    newStatus.timeBonus = 0;
    newStatus.point = 0;
    setTypingStatus(newStatus);
  };
};
