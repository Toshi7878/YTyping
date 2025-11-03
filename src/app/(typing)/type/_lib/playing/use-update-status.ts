import { MISS_PENALTY } from "../../../../../lib/build-map/build-map";
import {
  readLineSubstatus,
  readSubstatus,
  readUserStats,
  readUtilityRefParams,
  writeLineSubstatus,
  writeSubstatus,
  writeUserStats,
} from "../atoms/read-atoms";
import {
  readAllLineResult,
  readBuiltMap,
  readCombo,
  readLineWord,
  readTypingStatus,
  readUtilityParams,
  setCombo,
  setTypingStatus,
} from "../atoms/state-atoms";
import type { NextTypeChunk } from "../type";

export const useTypeSuccess = () => {
  const calcCurrentRank = useCalcCurrentRank();

  const updateSuccessStatus = ({
    isCompleted,
    constantRemainLineTime,
    updatePoint,
  }: {
    isCompleted?: boolean;
    constantRemainLineTime: number;
    updatePoint: number;
  }) => {
    const { type: lineTypeCount } = readLineSubstatus();
    const { completeCount, failureCount } = readSubstatus();
    const map = readBuiltMap();

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
    const { scene } = readUtilityParams();
    const { type: lineTypeCount } = readLineSubstatus();
    const { maxCombo, completeCount } = readSubstatus();
    writeSubstatus({ missCombo: 0 });

    if (lineTypeCount === 0) {
      writeLineSubstatus({ latency: constantLineTime });

      const { totalLatency } = readSubstatus();
      writeSubstatus({ totalLatency: totalLatency + constantLineTime });
    }

    const newCombo = readCombo() + 1;
    if (scene === "play") {
      if (newCombo > maxCombo) {
        writeSubstatus({ maxCombo: newCombo });
        writeUserStats({ maxCombo: newCombo });
      }
    }

    writeLineSubstatus({ type: lineTypeCount + 1 });

    if (isCompleted) {
      writeLineSubstatus({ isCompleted: true });
      writeSubstatus({ completeCount: completeCount + 1 });
      const { kanaToRomaConvertCount } = readSubstatus();
      writeSubstatus({ kanaToRomaConvertCount: kanaToRomaConvertCount + readLineWord().correct.r.length });
    }

    if (scene === "replay" || !typeChunk) {
      return;
    }

    const { types } = readLineSubstatus();

    writeLineSubstatus({ types: [...types, { c: successKey, is: true, t: constantLineTime }] });

    const substatus = readSubstatus();
    const userStats = readUserStats();
    if (typeChunk.t === "kana") {
      const { inputMode } = readUtilityParams();
      if (inputMode === "roma") {
        writeUserStats({ romaType: substatus.romaType + 1 });
        writeSubstatus({ romaType: substatus.romaType + 1 });
      } else if (inputMode === "kana") {
        writeUserStats({ kanaType: userStats.kanaType + 1 });
        writeSubstatus({ kanaType: substatus.kanaType + 1 });
      } else if (inputMode === "flick") {
        writeUserStats({ flickType: userStats.flickType + 1 });
        writeSubstatus({ flickType: substatus.flickType + 1 });
      }
    } else if (typeChunk.t === "alphabet") {
      writeUserStats({ englishType: userStats.englishType + 1 });
      writeSubstatus({ englishType: substatus.englishType + 1 });
    } else if (typeChunk.t === "num") {
      writeUserStats({ numType: userStats.numType + 1 });
      writeSubstatus({ numType: substatus.numType + 1 });
    } else if (typeChunk.t === "space") {
      writeUserStats({ spaceType: userStats.spaceType + 1 });
      writeSubstatus({ spaceType: substatus.spaceType + 1 });
    } else if (typeChunk.t === "symbol") {
      writeUserStats({ symbolType: userStats.symbolType + 1 });
      writeSubstatus({ symbolType: substatus.symbolType + 1 });
    }
  };

  return { updateSuccessStatus, updateSuccessStatusRefs };
};

const useCalcCurrentRank = () => {
  return (currentScore: number) => {
    // 現在のスコアが何番目に入るかを取得
    const { rankingScores } = readUtilityRefParams();
    const rank = rankingScores.findIndex((score) => score <= currentScore);
    return (rank < 0 ? rankingScores.length : rank) + 1;
  };
};

export const useTypeMiss = () => {
  const updateMissStatus = () => {
    const status = readTypingStatus();
    const newStatus = { ...status };

    newStatus.miss++;
    newStatus.point -= MISS_PENALTY;

    setCombo(0);
    setTypingStatus(newStatus);
  };

  const updateMissRefStatus = ({ constantLineTime, failKey }: { constantLineTime: number; failKey: string }) => {
    const map = readBuiltMap();
    if (!map) return;

    const { clearRate, missCombo } = readSubstatus();
    writeSubstatus({ clearRate: clearRate - map.missRate, missCombo: missCombo + 1 });

    const { miss: lineMissCount, types } = readLineSubstatus();

    writeLineSubstatus({
      miss: lineMissCount + 1,
      types: [...types, { c: failKey, t: constantLineTime }],
    });
  };

  return { updateMissStatus, updateMissRefStatus };
};

export const useLineUpdateStatus = () => {
  const calcCurrentRank = useCalcCurrentRank();
  return ({ constantLineTime }: { constantLineTime: number }) => {
    const map = readBuiltMap();
    if (!map) return;
    const lineWord = readLineWord();

    const { kanaToRomaConvertCount } = readSubstatus();
    writeSubstatus({ kanaToRomaConvertCount: kanaToRomaConvertCount + lineWord.correct.r.length });

    const isFailured = lineWord.nextChar.k;
    if (isFailured) {
      const { failureCount, totalLatency } = readSubstatus();
      writeSubstatus({ failureCount: failureCount + 1 });
      const { type: lineType } = readLineSubstatus();
      writeSubstatus({ totalLatency: lineType === 0 ? totalLatency + constantLineTime : totalLatency });
    }

    setTypingStatus((prev) => {
      let { score } = prev;
      let { line } = prev;
      let { rank } = prev;
      const { completeCount, failureCount } = readSubstatus();

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

  return ({ count, updateType }: { count: number; updateType: "lineUpdate" | "completed" }) => {
    const map = readBuiltMap();
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

    const lineResults = readAllLineResult();
    let totalTypeTime = 0;
    const { scene } = readUtilityParams();

    const updateCount = updateType === "completed" ? count + 1 : count;
    for (const lineResult of lineResults.slice(1, updateCount)) {
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
        totalTypeTime += lineResult.types[typesLength - 1]?.t ?? 0;
      }
      newStatus.type += lineResult.status.lType ?? 0;
    }

    const lineResult = lineResults[count - 1];
    newStatus.kpm = totalTypeTime > 0 ? Math.floor((newStatus.type / totalTypeTime) * 60) : 0;
    newStatus.rank = calcCurrentRank(newStatus.score);

    if (updateType === "completed") {
      newStatus.point = lineResult?.status.p ?? 0;
      newStatus.timeBonus = lineResult?.status.tBonus ?? 0;
    } else {
      newStatus.point = 0;
      newStatus.timeBonus = 0;
    }

    writeSubstatus({ totalTypeTime: lineResult?.status.tTime });
    setTypingStatus(newStatus);
  };
};
