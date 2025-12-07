import { readLineSubstatus, readSubstatus, writeSubstatus } from "../../atoms/ref";
import { readBuiltMap } from "../../atoms/state";
import { setAllTypingStatus } from "../../atoms/status";
import { readTypingWord } from "../../atoms/typing-word";
import { calcCurrentRank } from "./calc-current-rank";

export const updateStatusForLineUpdate = ({ constantLineTime }: { constantLineTime: number }) => {
  const map = readBuiltMap();
  if (!map) return;
  const typingWord = readTypingWord();

  // 現在の状態を取得
  const currentSubstatus = readSubstatus();
  const diffSubstatus: Partial<typeof currentSubstatus> = {};

  // 1. kanaToRomaConvertCount の更新
  diffSubstatus.kanaToRomaConvertCount = currentSubstatus.kanaToRomaConvertCount + typingWord.correct.roma.length;

  const isFailed = typingWord.nextChunk.kana;

  // 2. 失敗時の Substatus 更新
  if (isFailed) {
    diffSubstatus.failureCount = currentSubstatus.failureCount + 1;

    const { type: lineType } = readLineSubstatus();
    if (lineType === 0) {
      // lineType === 0 の場合のみ更新
      diffSubstatus.totalLatency = currentSubstatus.totalLatency + constantLineTime;
    }
  }

  // Substatus を一度に更新
  writeSubstatus(diffSubstatus);

  // 3. TypingStatus の更新
  setAllTypingStatus((prev) => {
    let { score, line, rank } = prev;

    if (isFailed) {
      score = prev.score + prev.point;

      const nextCompleteCount = currentSubstatus.completeCount;
      const nextFailureCount = diffSubstatus.failureCount ?? currentSubstatus.failureCount;

      line = map.typingLineIndexes.length - (nextCompleteCount + nextFailureCount);
      rank = calcCurrentRank(score);
    }

    return { ...prev, timeBonus: 0, point: 0, score, line, rank };
  });
};
