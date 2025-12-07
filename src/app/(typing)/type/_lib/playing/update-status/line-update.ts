import { readLineSubstatus, readSubstatus, writeSubstatus } from "../../atoms/ref";
import { readBuiltMap } from "../../atoms/state";
import { setAllTypingStatus } from "../../atoms/status";
import { readTypingWord } from "../../atoms/typing-word";
import { calcCurrentRank } from "./calc-current-rank";

export const updateStatusForLineUpdate = ({ constantLineTime }: { constantLineTime: number }) => {
  const map = readBuiltMap();
  if (!map) return;
  const typingWord = readTypingWord();

  const { kanaToRomaConvertCount } = readSubstatus();
  writeSubstatus({ kanaToRomaConvertCount: kanaToRomaConvertCount + typingWord.correct.roma.length });

  const isFailed = typingWord.nextChunk.kana;
  if (isFailed) {
    const { failureCount, totalLatency } = readSubstatus();
    writeSubstatus({ failureCount: failureCount + 1 });
    const { type: lineType } = readLineSubstatus();
    writeSubstatus({ totalLatency: lineType === 0 ? totalLatency + constantLineTime : totalLatency });
  }

  setAllTypingStatus((prev) => {
    let { score } = prev;
    let { line } = prev;
    let { rank } = prev;
    const { completeCount, failureCount } = readSubstatus();

    if (isFailed) {
      score = prev.score + prev.point;
      line = map.typingLineIndexes.length - (completeCount + failureCount);
      rank = calcCurrentRank(score);
    }

    return { ...prev, timeBonus: 0, point: 0, score, line, rank };
  });
};
