import { readUtilityRefParams } from "../../atoms/ref";

export const calcCurrentRank = (currentScore: number) => {
  const { rankingScores } = readUtilityRefParams();
  const rank = rankingScores.findIndex((score) => score <= currentScore);
  return (rank < 0 ? rankingScores.length : rank) + 1;
};
