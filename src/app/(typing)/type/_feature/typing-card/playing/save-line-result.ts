import { createDisplayWord } from "lyrics-typing-engine";
import { countKanaWordWithDakuonSplit } from "@/utils/kana";
import { countPerMinute } from "@/utils/math";
import { getBuiltMap } from "../../atoms/built-map";
import { getAllLineResult, setLineResult } from "../../atoms/line-result";
import { getLineSubstatus } from "../../atoms/line-substatus";
import { getTypingSubstatus, setTypingSubstatus } from "../../atoms/substatus";
import { getPlayingInputMode, getTypingWord } from "../../atoms/typing-word";
import { CHAR_POINT, MISS_PENALTY_POINT } from "../../lib/const";
import { getTypingStatus, setTypingStatus } from "../../tabs/typing-status/status-cell";
import { getIsPaused, getMediaSpeed } from "../../youtube/youtube-player";
import { getCombo } from "../header/combo";
import { getLineKpm } from "../header/line-kpm";
import { getScene } from "../typing-card";

export const hasLineResultImproved = (count: number) => {
  const lineResults = getAllLineResult();
  const { missCount } = getLineSubstatus();
  const savedLineResult = lineResults[count];
  const typingStatus = getTypingStatus();

  const currentLineScore = typingStatus.point + typingStatus.timeBonus + missCount * MISS_PENALTY_POINT;
  const savedLineScore =
    (savedLineResult?.status.point ?? 0) +
    (savedLineResult?.status.timeBonus ?? 0) +
    (savedLineResult?.status.missCount ?? 0) * MISS_PENALTY_POINT;

  const isPaused = getIsPaused();

  const scene = getScene();

  const playSpeed = getMediaSpeed();
  return currentLineScore >= savedLineScore && !isPaused && scene !== "replay" && playSpeed >= 1;
};

export const saveLineResult = (count: number, constantLineTime: number) => {
  const { lostWord, actualLostNotes, pointLostNotes } = generateLostWord();
  const map = getBuiltMap();
  if (!map) return;

  if (actualLostNotes > 0) setTypingStatus((prev) => ({ ...prev, lost: prev.lost + actualLostNotes }));
  if (pointLostNotes > 0) {
    const { clearRate } = getTypingSubstatus();
    setTypingSubstatus({ clearRate: clearRate - map.keyRate * pointLostNotes });
  }

  const typingStatus = getTypingStatus();
  const { missCount, typeCount, types, startSpeed, startInputMode } = getLineSubstatus();
  const lineRkpm = countPerMinute(typeCount, Math.max(0, constantLineTime - (types[0]?.time ?? 0)));
  const isTypingLine = (map.lines[count]?.kpm.roma ?? 0) > 0;
  const { totalTypeTime } = getTypingSubstatus();
  const roundedTotalTypeTime = Math.floor(totalTypeTime * 1000) / 1000;

  const typingWord = getTypingWord();
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
            rkpm: lineRkpm,
            kpm: getLineKpm(),
            lostWord,
            lostCount: actualLostNotes,
            combo: getCombo(),
            typingTime: roundedTotalTypeTime,
            mode: startInputMode,
            speed: startSpeed,
          },
          types,
        }
      : {
          status: {
            combo: getCombo(),
            typingTime: roundedTotalTypeTime,
            mode: startInputMode,
            speed: startSpeed,
          },
          types,
        },
  });
};

const generateLostWord = () => {
  const typingWord = getTypingWord();

  const isCompleted = !typingWord.nextChunk.kana;

  if (isCompleted) {
    return { lostWord: "", actualLostNotes: 0, pointLostNotes: 0 };
  }

  const { nextChar, remainWord } = createDisplayWord(typingWord);
  const pointLostNotes = !isCompleted ? typingWord.nextChunk.point / CHAR_POINT + remainWord.roma.length : 0;

  const inputMode = getPlayingInputMode();
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
