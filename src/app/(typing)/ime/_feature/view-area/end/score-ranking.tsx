import { useTranslations } from "next-intl";
import type { HTMLAttributes } from "react";
import { useResultRanking } from "../../memu/result-dialog";

export const ScoreRanking = (props: HTMLAttributes<HTMLDivElement>) => {
  const t = useTranslations("ime");
  const resultRanking = useResultRanking();

  return (
    <div {...props}>
      <ul className="list-none">
        {resultRanking.map(({ name, score, rank }) => (
          <li key={name}>{t("ranking", { rank, name, score: score.toFixed(0) })}</li>
        ))}
      </ul>
    </div>
  );
};
