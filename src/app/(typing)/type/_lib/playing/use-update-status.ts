import { MISS_PENALTY } from "../../../../../lib/build-map/build-map";
import { useGameUtilityReferenceParams, useLineStatus, useTypingDetails, useUserStats } from "../atoms/read-atoms";
import {
  useReadAllLineResult,
  useReadCombo,
  useReadGameUtilParams,
  useReadLineWord,
  useReadMap,
  useReadTypingStatus,
  useSetCombo,
  useSetLineKpm,
  useSetTypingStatus,
} from "../atoms/state-atoms";
import type { NextTypeChunk } from "../type";

export const useTypeSuccess = () => {
  const setCombo = useSetCombo();
  const { setTypingStatus } = useSetTypingStatus();
  const calcCurrentRank = useCalcCurrentRank();

  const { readUserStats, writeUserStats } = useUserStats();
  const { readLineStatus, writeLineStatus } = useLineStatus();
  const { readStatus, writeStatus } = useTypingDetails();
  const readGameStateUtils = useReadGameUtilParams();

  const readMap = useReadMap();
  const readCombo = useReadCombo();
  const readLineWord = useReadLineWord();

  const updateSuccessStatus = ({
    isCompleted,
    constantRemainLineTime,
    updatePoint,
  }: {
    isCompleted?: boolean;
    constantRemainLineTime: number;
    updatePoint: number;
  }) => {
    const lineTypeCount = readLineStatus().type;
    const { completeCount, failureCount } = readStatus();
    const map = readMap();

    setTypingStatus((prev) => {
      let { point } = prev;
      if (lineTypeCount === 1) point = updatePoint;
      else if (updatePoint > 0) point = prev.point + updatePoint;

      const type = prev.type + 1;

      let { timeBonus } = prev;
      let { score } = prev;
      let { line } = prev;
      let { rank } = prev;

      if (isCompleted) {
        const tb = Math.floor(constantRemainLineTime * 100);
        timeBonus = tb;
        score = prev.score + point + tb;
        if (map) {
          line = map.lineLength - (completeCount + failureCount);
        }
        rank = calcCurrentRank(score);
      }

      return { ...prev, point, type, timeBonus, score, line, rank };
    });

    setCombo((prev) => prev + 1);
  };

  const updateSuccessStatusRefs = ({
    constantLineTime,
    isCompleted,
    typeChunk,
    successKey,
  }: {
    constantLineTime: number;
    isCompleted?: boolean;
    typeChunk?: NextTypeChunk;
    successKey: string;
  }) => {
    const { scene } = readGameStateUtils();
    const lineTypingStatusRef = readLineStatus();
    const { maxCombo, completeCount } = readStatus();
    writeStatus({ missCombo: 0 });

    if (lineTypingStatusRef.type === 0) {
      writeLineStatus({ latency: constantLineTime });

      const { totalLatency } = readStatus();
      writeStatus({ totalLatency: totalLatency + constantLineTime });
    }

    const newCombo = readCombo() + 1;
    if (scene === "play") {
      if (newCombo > maxCombo) {
        writeStatus({ maxCombo: newCombo });

        writeUserStats({ maxCombo: newCombo });
      }
    }

    writeLineStatus({
      type: readLineStatus().type + 1,
    });

    if (isCompleted) {
      writeLineStatus({
        isCompleted: true,
      });
      writeStatus({
        completeCount: completeCount + 1,
      });
      writeStatus({
        kanaToRomaConvertCount: readStatus().kanaToRomaConvertCount + readLineWord().correct.r.length,
      });
    }

    if (scene === "replay" || !typeChunk) {
      return;
    }

    writeLineStatus({
      types: [
        ...readLineStatus().types,
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
  };

  return { updateSuccessStatus, updateSuccessStatusRefs };
};

const useCalcCurrentRank = () => {
  const { readGameUtilRefParams } = useGameUtilityReferenceParams();

  return (currentScore: number) => {
    // 現在のスコアが何番目に入るかを取得
    const { rankingScores } = readGameUtilRefParams();
    const rank = rankingScores.findIndex((score) => score <= currentScore);
    return (rank < 0 ? rankingScores.length : rank) + 1;
  };
};

export const useTypeMiss = () => {
  const setCombo = useSetCombo();
  const { setTypingStatus } = useSetTypingStatus();

  const { readLineStatus, writeLineStatus } = useLineStatus();
  const { readStatus, writeStatus } = useTypingDetails();
  const readTypingStatus = useReadTypingStatus();
  const readMap = useReadMap();

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
    if (!map) return;

    writeStatus({
      clearRate: readStatus().clearRate - map.missRate,
      missCombo: readStatus().missCombo + 1,
    });

    writeLineStatus({
      miss: readLineStatus().miss + 1,
      types: [
        ...readLineStatus().types,
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
  const { setTypingStatus } = useSetTypingStatus();
  const { readStatus, writeStatus } = useTypingDetails();
  const readMap = useReadMap();
  const readLineWord = useReadLineWord();
  const { readLineStatus } = useLineStatus();
  return ({ constantLineTime }: { constantLineTime: number }) => {
    const map = readMap();
    if (!map) return;
    const lineWord = readLineWord();

    writeStatus({
      kanaToRomaConvertCount: readStatus().kanaToRomaConvertCount + lineWord.correct.r.length,
    });

    const isFailured = lineWord.nextChar.k;
    if (isFailured) {
      const status = readStatus();

      writeStatus({ failureCount: status.failureCount + 1 });

      const { totalLatency } = readStatus();
      const { type: lineType } = readLineStatus();

      writeStatus({ totalLatency: lineType === 0 ? totalLatency + constantLineTime : totalLatency });
    }

    setTypingStatus((prev) => {
      let { score } = prev;
      let { line } = prev;
      let { rank } = prev;
      const { completeCount, failureCount } = readStatus();

      if (isFailured) {
        score = prev.score + prev.point;
        line = map.lineLength - (completeCount + failureCount);
        rank = calcCurrentRank(score);
      }

      return { ...prev, timeBonus: 0, point: 0, score, line, rank };
    });
  };
};

export const useUpdateAllStatus = () => {
  const calcCurrentRank = useCalcCurrentRank();
  const readMap = useReadMap();
  const readLineResults = useReadAllLineResult();
  const { setTypingStatus } = useSetTypingStatus();
  const readGameStateUtils = useReadGameUtilParams();
  const setLineKpm = useSetLineKpm();
  const { writeLineStatus } = useLineStatus();
  const setCombo = useSetCombo();

  const { writeStatus } = useTypingDetails();

  return ({ count, updateType }: { count: number; updateType: "lineUpdate" | "completed" }) => {
    const map = readMap();
    if (!map) return;

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

    if (count <= 0) {
      return newStatus;
    }
    const lineResults = readLineResults();
    let totalTypeTime = 0;
    const { scene } = readGameStateUtils();

    for (let i = 0; i < count; i++) {
      const lineResult = lineResults[i];
      newStatus.score += (lineResult.status.p ?? 0) + (lineResult.status.tBonus ?? 0);
      newStatus.miss += lineResult.status.lMiss ?? 0;
      newStatus.lost += lineResult.status.lLost ?? 0;

      if (scene === "practice") {
        newStatus.line -= lineResult.status.lLost === 0 ? 1 : 0;
      } else if (scene === "replay") {
        newStatus.line -= lineResult.status.lType !== undefined ? 1 : 0;
      }

      const typesLength = lineResult.types.length;
      if (typesLength) {
        totalTypeTime += lineResult.types[typesLength - 1].t;
      }
      newStatus.type += lineResult.status.lType ?? 0;
    }

    const lineResult = lineResults[count];
    newStatus.kpm = totalTypeTime > 0 ? Math.floor((newStatus.type / totalTypeTime) * 60) : 0;
    newStatus.rank = calcCurrentRank(newStatus.score);

    if (updateType === "completed") {
      newStatus.point = lineResult.status.p ?? 0;
      newStatus.timeBonus = lineResult.status.tBonus ?? 0;
    } else {
      newStatus.point = 0;
      newStatus.timeBonus = 0;
    }

    if (scene === "practice") {
      writeStatus({ totalTypeTime });
    } else if (scene === "replay") {
      writeStatus({
        totalTypeTime: lineResult.status.tTime,
      });
      setCombo(lineResult.status.combo);
      setLineKpm(lineResult.status.lKpm ?? 0);
      writeLineStatus({ isCompleted: true });
    }

    setTypingStatus(newStatus);
  };
};
