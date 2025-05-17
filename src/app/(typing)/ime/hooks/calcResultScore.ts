import { useReadStatus } from "../atom/stateAtoms";
import { WordsResult } from "../type";

export const useCalcResultScore = () => {
  const readStatus = useReadStatus();
  return (wordsResult: WordsResult) => {
    // typeCountとscoreをreduceで計算
    const { typeCount, score } = wordsResult.reduce(
      (acc, curr) => {
        if (curr.evaluation === "Great" || curr.evaluation === "Good") {
          const joinLyricsLength = curr.targetWord ? curr.targetWord.length : 0;
          // Goodの場合は1.5で割る
          const addCount = joinLyricsLength / (curr.evaluation === "Good" ? 1.5 : 1);
          acc.typeCount += addCount;
        }
        acc.totalNotes += curr.targetWord ? curr.targetWord.length : 0;
        return acc;
      },
      { typeCount: 0, totalNotes: 0, score: 0 }
    );

    // totalNotesが0の場合はscoreを0に
    const finalScore =
      score ||
      (typeCount && wordsResult.length
        ? Math.round(
            (1000 / (wordsResult.reduce((sum, w) => sum + (w.targetWord ? w.targetWord.length : 0), 0) || 1)) *
              typeCount
          )
        : 0);

    return {
      typeCount,
      score: finalScore,
    };
  };
};
