import type { HTMLAttributes } from "react";
import { useResultRanking } from "../../memu/result-dialog";

export const ScoreRanking = (props: HTMLAttributes<HTMLDivElement>) => {
  const resultRanking = useResultRanking();

  return (
    <div {...props}>
      <ul className="list-none">
        {resultRanking.map(({ name, score, rank }) => (
          <li key={name}>
            {rank}位 {name}: {score.toFixed(0)}点
          </li>
        ))}
      </ul>
    </div>
  );
};
