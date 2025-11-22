import { readLineSubstatus, readSubstatus, writeSubstatus } from "../../atoms/ref";
import { readBuiltMap, readLineWord, setTypingStatus } from "../../atoms/state";
import { calcCurrentRank } from "./calc-current-rank";

export const updateStatusForLineUpdate = ({ constantLineTime }: { constantLineTime: number }) => {
  const map = readBuiltMap();
  if (!map) return;
  const lineWord = readLineWord();

  const { kanaToRomaConvertCount } = readSubstatus();
  writeSubstatus({ kanaToRomaConvertCount: kanaToRomaConvertCount + lineWord.correct.roma.length });

  const isFailed = lineWord.nextChunk.kana;
  if (isFailed) {
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

    if (isFailed) {
      score = prev.score + prev.point;
      line = map.typingLineIndexes.length - (completeCount + failureCount);
      rank = calcCurrentRank(score);
    }

    return { ...prev, timeBonus: 0, point: 0, score, line, rank };
  });
};
