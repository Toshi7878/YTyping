import { useTranslations } from "next-intl";
import { type Session, useSession } from "@/auth/client";
import { useMinMediaSpeedState } from "../../youtube/youtube-player";
import { type SceneType, useSceneState } from "../typing-card";
import { RandomEmoji } from "./random-emoji";

export const ResultMessage = ({
  bestScore,
  status,
}: {
  bestScore: number | null;
  status: { score: number; miss: number; lost: number };
}) => {
  const t = useTranslations("typing.end");
  const { data: session } = useSession();
  const scene = useSceneState();
  const minMediaSpeed = useMinMediaSpeedState();
  const isPerfect = status.miss === 0 && status.lost === 0;

  return (
    <div className="mx-2 text-left text-5xl md:text-3xl" id="end_text">
      {isPerfect && scene === "play_end" && <span>{t("perfect")}</span>}
      <span>
        <Message bestScore={bestScore} score={status.score} scene={scene} session={session} />
      </span>
      {minMediaSpeed < 1 && <div>{t("needSpeed")}</div>}
    </div>
  );
};

const Message = ({
  bestScore,
  score,
  scene,
  session,
}: {
  bestScore: number | null;
  score: number;
  scene: SceneType;
  session: Session | null;
}) => {
  const t = useTranslations("typing.end");
  if (scene === "practice_end") return t("practiceEnd");
  if (scene === "replay_end") return t("replayEnd");
  if (!session) return t("scoreLogin", { score });
  if (bestScore === null) return t("firstRecord", { score });
  if (score >= bestScore)
    return (
      <>
        {t("newBest", { best: bestScore, score })}
        <wbr />
        <RandomEmoji />
      </>
    );
  return t("bestInfo", { best: bestScore, diff: bestScore - score });
};
