import { countKanaWordWithDakuonSplit } from "@/utils/kana";
import { readAllLineResult, setLineResult } from "../atoms/family";
import { readLineSubstatus, readSubstatus, writeSubstatus } from "../atoms/ref";
import { readPlaySpeed } from "../atoms/speed-reducer";
import {
  readBuiltMap,
  readCombo,
  readLineKpm,
  readLineWord,
  readTypingStatus,
  readUtilityParams,
  setTypingStatus,
} from "../atoms/state";
import { CHAR_POINT, MISS_PENALTY_POINT } from "../const";

export const hasLineResultImproved = (count: number) => {
  const lineResults = readAllLineResult();
  const { miss: lineMiss } = readLineSubstatus();
  const savedLineResult = lineResults[count];
  const typingStatus = readTypingStatus();

  const currentLineScore = typingStatus.point + typingStatus.timeBonus + lineMiss * MISS_PENALTY_POINT;
  const savedLineScore =
    (savedLineResult?.status.p ?? 0) +
    (savedLineResult?.status.tBonus ?? 0) +
    (savedLineResult?.status.lMiss ?? 0) * MISS_PENALTY_POINT;

  const { scene, isPaused } = readUtilityParams();
  const { playSpeed } = readPlaySpeed();
  return currentLineScore >= savedLineScore && !isPaused && scene !== "replay" && playSpeed >= 1;
};

export const saveLineResult = (count: number) => {
  const { lostWord, actualLostNotes, pointLostNotes } = generateLostWord();
  const map = readBuiltMap();
  if (!map) return;

  if (actualLostNotes > 0) setTypingStatus((prev) => ({ ...prev, lost: prev.lost + actualLostNotes }));
  if (pointLostNotes > 0) {
    const { clearRate } = readSubstatus();
    writeSubstatus({ clearRate: clearRate - map.keyRate * pointLostNotes });
  }

  const typingStatus = readTypingStatus();
  const { miss: lineMiss, type: lineType, types, startSpeed, startInputMode, rkpm: lineRkpm } = readLineSubstatus();
  const isTypingLine = (map.lines[count]?.kpm.roma ?? 0) > 0;
  const { totalTypeTime } = readSubstatus();
  const roundedTotalTypeTime = Math.floor(totalTypeTime * 1000) / 1000;

  setLineResult({
    index: count,
    lineResult: isTypingLine
      ? {
          status: {
            p: typingStatus.point,
            tBonus: typingStatus.timeBonus,
            lType: lineType,
            lMiss: lineMiss,
            lRkpm: lineRkpm,
            lKpm: readLineKpm(),
            lostW: lostWord,
            lLost: actualLostNotes,
            combo: readCombo(),
            tTime: roundedTotalTypeTime,
            mode: startInputMode,
            sp: startSpeed,
          },
          types,
        }
      : {
          status: {
            combo: readCombo(),
            tTime: roundedTotalTypeTime,
            mode: startInputMode,
            sp: startSpeed,
          },
          types,
        },
  });
};

const generateLostWord = () => {
  const lineWord = readLineWord();

  const isCompleted = !lineWord.nextChunk.kana;

  if (isCompleted) {
    return { lostWord: "", actualLostNotes: 0, pointLostNotes: 0 };
  }

  const romaLostWordOmitNextChar = lineWord.wordChunks.map((chunk) => chunk.romaPatterns[0]).join("");
  const pointLostNotes = !isCompleted ? lineWord.nextChunk.point / CHAR_POINT + romaLostWordOmitNextChar.length : 0;

  const { inputMode } = readUtilityParams();

  switch (inputMode) {
    case "roma": {
      const romaLostWord = lineWord.nextChunk.romaPatterns[0] + romaLostWordOmitNextChar;
      const actualLostNotes = romaLostWord.length;
      return { lostWord: romaLostWord, actualLostNotes, pointLostNotes };
    }
    case "kana":
    case "flick": {
      const kanaLostWord = lineWord.nextChunk.kana + lineWord.wordChunks.map((chunk) => chunk.kana).join("");
      const actualLostNotes = countKanaWordWithDakuonSplit({ kanaWord: kanaLostWord });
      return { lostWord: kanaLostWord, actualLostNotes, pointLostNotes };
    }
  }
};
