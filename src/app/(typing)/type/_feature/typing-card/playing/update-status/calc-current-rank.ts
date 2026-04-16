import { getRankingData } from "../../../tabs/ranking/get-ranking-result";

export const calcCurrentRank = (currentScore: number) => {
  const ranking = getRankingData();

  const rank = ranking.findIndex(({ score }) => score <= currentScore);
  return (rank < 0 ? ranking.length : rank) + 1;
};
