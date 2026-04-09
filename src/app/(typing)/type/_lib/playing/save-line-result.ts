import { createDisplayWord } from "lyrics-typing-engine";
import { countKanaWordWithDakuonSplit } from "@/utils/kana";
import { readAllLineResult, setLineResult } from "../atoms/family";
import { readLineSubstatus, readTypingSubstatus, writeTypingSubstatus } from "../atoms/ref";
import { readBuiltMap, readMediaSpeed, readUtilityParams } from "../atoms/state";
import { readTypingStatus, setAllTypingStatus } from "../atoms/status";
import { readCombo, readLineKpm } from "../atoms/sub-status";
import { readTypingWord } from "../atoms/typing-word";
import { CHAR_POINT, MISS_PENALTY_POINT } from "../const";

export const hasLineResultImproved = (count: number) => {
  const lineResults = readAllLineResult();
  const { missCount } = readLineSubstatus();
  const savedLineResult = lineResults[count];
  const typingStatus = readTypingStatus();

  const currentLineScore = typingStatus.point + typingStatus.timeBonus + missCount * MISS_PENALTY_POINT;
  const savedLineScore =
    (savedLineResult?.status.point ?? 0) +
    (savedLineResult?.status.timeBonus ?? 0) +
    (savedLineResult?.status.missCount ?? 0) * MISS_PENALTY_POINT;

  const { scene, isPaused } = readUtilityParams();
  const playSpeed = readMediaSpeed();
  return currentLineScore >= savedLineScore && !isPaused && scene !== "replay" && playSpeed >= 1;
};

export const saveLineResult = (count: number) => {
  const { lostWord, actualLostNotes, pointLostNotes } = generateLostWord();
  const map = readBuiltMap();
  if (!map) return;

  if (actualLostNotes > 0) setAllTypingStatus((prev) => ({ ...prev, lost: prev.lost + actualLostNotes }));
  if (pointLostNotes > 0) {
    const { clearRate } = readTypingSubstatus();
    writeTypingSubstatus({ clearRate: clearRate - map.keyRate * pointLostNotes });
  }

  const typingStatus = readTypingStatus();
  const { missCount, typeCount, types, startSpeed, startInputMode, rkpm } = readLineSubstatus();
  const isTypingLine = (map.lines[count]?.kpm.roma ?? 0) > 0;
  const { totalTypeTime } = readTypingSubstatus();
  const roundedTotalTypeTime = Math.floor(totalTypeTime * 1000) / 1000;

  const typingWord = readTypingWord();
  const lostHiraganaJoined = typingWord.nextChunk.kana
    ? `${typingWord.nextChunk.kana}${typingWord.wordChunks
        .slice(typingWord.wordChunksIndex)
        .map((chunk) => chunk.kana)
        .join("")}`
    : "";

  setLineResult({
    index: count,
    lineResult: isTypingLine
      ? {
          status: {
            point: typingStatus.point,
            timeBonus: typingStatus.timeBonus,
            typeCount,
            missCount,
            typedHiragana: map.isCaseSensitive ? typingWord.correct.kana : typingWord.correct.kana.toLowerCase(),
            lostHiragana: lostHiraganaJoined,
            rkpm,
            kpm: readLineKpm(),
            lostWord,
            lostCount: actualLostNotes,
            combo: readCombo(),
            typingTime: roundedTotalTypeTime,
            mode: startInputMode,
            speed: startSpeed,
          },
          types,
        }
      : {
          status: {
            combo: readCombo(),
            typingTime: roundedTotalTypeTime,
            mode: startInputMode,
            speed: startSpeed,
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
