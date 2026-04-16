import { type Session, useSession } from "@/lib/auth-client";
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
  const { data: session } = useSession();
  const scene = useSceneState();
  const minMediaSpeed = useMinMediaSpeedState();
  const isPerfect = status.miss === 0 && status.lost === 0;

  return (
    <div className="mx-2 text-left text-5xl md:text-3xl" id="end_text">
      {isPerfect && scene === "play_end" && <span>パーフェクト！！</span>}
      <span>
        <Message bestScore={bestScore} score={status.score} scene={scene} session={session} />
      </span>
      {minMediaSpeed < 1 && <div>1.00倍速以上でランキング登録できます。</div>}
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
  if (scene === "practice_end") return "練習モード終了";
  if (scene === "replay_end") return "リプレイ再生終了";
  if (!session) return `スコアは ${score} です。ログインをするとランキングに登録することができます。`;
  if (bestScore === null) return `初めての記録です！スコアは ${score} です。`;
  if (score >= bestScore)
    return (
      <>
        おめでとうございます！最高スコアが {bestScore} から {score} に更新されました！ <wbr />
        <RandomEmoji />
      </>
    );
  return `最高スコアは ${bestScore} です。記録更新まであと ${bestScore - score} です。`;
};
