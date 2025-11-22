import type { WordChunk } from "lyrics-typing-engine";
import {
  readLineSubstatus,
  readSubstatus,
  readUserStats,
  writeLineSubstatus,
  writeSubstatus,
  writeUserStats,
} from "../../atoms/ref";
import { readBuiltMap, readCombo, readLineWord, readUtilityParams, setCombo, setTypingStatus } from "../../atoms/state";
import { calcCurrentRank } from "./calc-current-rank";

export const updateSuccessStatus = ({
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
      const timeBonusValue = Math.floor(constantRemainLineTime * 100);
      timeBonus = timeBonusValue;
      score = prev.score + point + timeBonusValue;
      if (map) {
        line = map.typingLineIndexes.length - (completeCount + failureCount);
      }
      rank = calcCurrentRank(score);
    }

    return { ...prev, point, type, timeBonus, score, line, rank };
  });

  setCombo((prev) => prev + 1);
};

export const updateSuccessSubstatus = ({
  constantLineTime,
  isCompleted,
  charType,
  successKey,
}: {
  constantLineTime: number;
  isCompleted?: boolean;
  charType?: WordChunk["type"];
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
    writeSubstatus({ kanaToRomaConvertCount: kanaToRomaConvertCount + readLineWord().correct.roma.length });
  }

  if (scene === "replay" || !charType) {
    return;
  }

  const { types } = readLineSubstatus();

  writeLineSubstatus({ types: [...types, { c: successKey, is: true, t: constantLineTime }] });

  const substatus = readSubstatus();
  const userStats = readUserStats();
  if (charType === "kana") {
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
  } else if (charType === "alphabet") {
    writeUserStats({ englishType: userStats.englishType + 1 });
    writeSubstatus({ englishType: substatus.englishType + 1 });
  } else if (charType === "num") {
    writeUserStats({ numType: userStats.numType + 1 });
    writeSubstatus({ numType: substatus.numType + 1 });
  } else if (charType === "space") {
    writeUserStats({ spaceType: userStats.spaceType + 1 });
    writeSubstatus({ spaceType: substatus.spaceType + 1 });
  } else if (charType === "symbol") {
    writeUserStats({ symbolType: userStats.symbolType + 1 });
    writeSubstatus({ symbolType: substatus.symbolType + 1 });
  }
};
