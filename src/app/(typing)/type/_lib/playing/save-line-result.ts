import { createDisplayWord } from "lyrics-typing-engine";
import { countKanaWordWithDakuonSplit } from "@/utils/kana";
import { readAllLineResult, setLineResult } from "../atoms/family";
import { readLineSubstatus, readSubstatus, writeSubstatus } from "../atoms/ref";
import { readPlaySpeed } from "../atoms/speed-reducer";
import { readBuiltMap, readUtilityParams } from "../atoms/state";
import { readTypingStatus, setAllTypingStatus } from "../atoms/status";
import { readCombo, readLineKpm } from "../atoms/sub-status";
import { readTypingWord } from "../atoms/typing-word";
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

  if (actualLostNotes > 0) setAllTypingStatus((prev) => ({ ...prev, lost: prev.lost + actualLostNotes }));
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
  const typingWord = readTypingWord();

  const isCompleted = !typingWord.nextChunk.kana;

  if (isCompleted) {
    return { lostWord: "", actualLostNotes: 0, pointLostNotes: 0 };
  }

  const { nextChar, remainWord } = createDisplayWord(typingWord);
  const pointLostNotes = !isCompleted ? typingWord.nextChunk.point / CHAR_POINT + remainWord.roma.length : 0;

  const { inputMode } = readUtilityParams();
  switch (inputMode) {
    case "roma": {
      const romaLostWord = nextChar.roma + remainWord.roma;
      const actualLostNotes = romaLostWord.length;
      return { lostWord: romaLostWord, actualLostNotes, pointLostNotes };
    }
    case "kana":
    case "flick": {
      const kanaLostWord = nextChar.kana + remainWord.kana;
      const actualLostNotes = countKanaWordWithDakuonSplit({ kanaWord: kanaLostWord });
      return { lostWord: kanaLostWord, actualLostNotes, pointLostNotes };
    }
  }
};
