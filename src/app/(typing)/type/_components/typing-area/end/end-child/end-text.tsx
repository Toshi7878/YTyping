import { useSession } from "next-auth/react";
import { useState } from "react";
import { usePlaySpeedState } from "@/app/(typing)/type/_lib/atoms/speed-reducer-atoms";
import { useSceneState, useTypingStatusState } from "@/app/(typing)/type/_lib/atoms/state-atoms";
import { useGetMyRankingResult } from "@/app/(typing)/type/_lib/ranking/use-get-my-ranking-result";
import { RandomEmoji } from "./child/random-emoji";

export const EndText = () => {
  const getMyRankingResult = useGetMyRankingResult();
  const { data: session } = useSession();
  const speed = usePlaySpeedState();
  const { score, miss, lost } = useTypingStatusState();
  const [bestScore] = useState(() => getMyRankingResult()?.score ?? 0);
  const isPerfect = miss === 0 && lost === 0;
  const scene = useSceneState();

  return (
    <div className="mx-2 text-left text-3xl md:text-3xl" id="end_text">
      {isPerfect && scene === "play_end" && <span>パーフェクト！！</span>}
      <span>
        {scene === "practice_end" ? (
          "練習モード終了"
        ) : scene === "replay_end" ? (
          "リプレイ再生終了"
        ) : !session ? (
          `スコアは ${score} です。ログインをするとランキングに登録することができます。`
        ) : bestScore === 0 ? (
          `初めての記録です！スコアは ${score} です。`
        ) : score >= bestScore ? (
          <>
            おめでとうございます！最高スコアが {bestScore} から {score} に更新されました！
            <wbr />
            <RandomEmoji />
          </>
        ) : (
          <>
            最高スコアは {bestScore} です。記録更新まであと {bestScore - score} です。
          </>
        )}
      </span>
      {speed.minPlaySpeed < 1 && <div>1.00倍速以上でランキング登録できます。</div>}
    </div>
  );
};
