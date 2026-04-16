import { getBuiltMap } from "../../../atoms/built-map";
import { getTypingSubstatus, setTypingSubstatus } from "../../../atoms/substatus";
import { getTypingWord } from "../../../atoms/typing-word";
import { setTypingStatus } from "../../../tabs/typing-status/status-cell";
import { calcCurrentRank } from "./calc-current-rank";

export const updateStatusForLineUpdate = () => {
  const map = getBuiltMap();
  if (!map) return;
  const typingWord = getTypingWord();

  const currentSubstatus = getTypingSubstatus();
  const diffSubstatus: Partial<typeof currentSubstatus> = {};

  diffSubstatus.kanaToRomaConvertCount = currentSubstatus.kanaToRomaConvertCount + typingWord.correct.roma.length;

  const isFailed = typingWord.nextChunk.kana;

  if (isFailed) {
    diffSubstatus.failureCount = currentSubstatus.failureCount + 1;
  }

  setTypingSubstatus(diffSubstatus);

  setTypingStatus((prev) => {
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
