import { usePlaySpeedState } from "@/app/(typing)/type/_lib/atoms/speedReducerAtoms";
import { useSceneState, useTypingStatusState } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { useGetMyRankingResult } from "@/app/(typing)/type/_lib/hooks/getMyRankingResult";
import { useSession } from "next-auth/react";
import RandomEmoji from "./child/RandomEmoji";

const EndText = () => {
  const getMyRankingResult = useGetMyRankingResult();
  const myBestScore = getMyRankingResult()?.status?.score ?? 0;
  const { data: session } = useSession();
  const speed = usePlaySpeedState();
  const status = useTypingStatusState();
  const isPerfect = status.miss === 0 && status.lost === 0;
  const scene = useSceneState();

  return (
    <div className="mx-2 text-left text-3xl md:text-3xl" id="end_text">
      {isPerfect && scene === "play_end" && <span>パーフェクト！！</span>}
      <span>
        {scene === "practice_end" ? (
          <>練習モード終了</>
        ) : scene === "replay_end" ? (
          <>リプレイ再生終了</>
        ) : !session ? (
          <>
            スコアは{status.score}
            です。ログインをするとランキングに登録することができます。
          </>
        ) : myBestScore === 0 ? (
          <>初めての記録です！スコアは {status.score} です。</>
        ) : status.score >= myBestScore ? (
          <>
            おめでとうございます！最高スコアが {myBestScore} から {status.score} に更新されました！
            <wbr />
            <RandomEmoji />
          </>
        ) : (
          <>
            最高スコアは {myBestScore} です。記録更新まであと {myBestScore - status.score} です。
          </>
        )}
      </span>
      {speed.defaultSpeed < 1 && <div>1.00倍速以上でランキング登録できます。</div>}
    </div>
  );
};

export default EndText;
