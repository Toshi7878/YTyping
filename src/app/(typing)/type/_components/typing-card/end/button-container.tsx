import { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useMinMediaSpeedState, useSceneState } from "@/app/(typing)/type/_lib/atoms/state";
import { getRankingMyResult } from "@/app/(typing)/type/_lib/get-ranking-result";
import { commitPlayRestart } from "@/app/(typing)/type/_lib/playing/commit-play-restart";
import type { PlayMode, SceneType } from "@/app/(typing)/type/_lib/type";
import { Button } from "@/components/ui/button";
import { confirmDialog } from "@/components/ui/confirm-dialog";
import { type Session, useSession } from "@/lib/auth-client";
import { useTypingStatusState } from "../../../_lib/atoms/status";
import { EndResultLineSheet } from "../line-result/line-result-sheet";
import { RegisterRankingButton } from "./submit-ranking-button";

export const EndButtonContainer = () => {
  const { data: session } = useSession();
  const status = useTypingStatusState();
  const scene = useSceneState();
  const [isSubmitRankingButtonDisabled, setIsSubmitRankingButtonDisabled] = useState(false);
  const [bestScore] = useState(() => getRankingMyResult(session)?.score ?? 0);
  const minMediaSpeed = useMinMediaSpeedState();
  const isRankingRegistration = canRankingRegistration({ session, status, bestScore, scene, minMediaSpeed });

  return (
    <>
      <div className="flex items-center justify-around" id="end_main_buttons">
        {isRankingRegistration && (
          <RegisterRankingButton
            showAlert={bestScore > status.score}
            disabled={isSubmitRankingButtonDisabled}
            onSuccess={() => setIsSubmitRankingButtonDisabled(true)}
          />
        )}
        <EndResultLineSheet
          trigger={
            <Button size="4xl" variant="primary-hover-light" className="max-sm:h-40 max-sm:w-xl max-sm:text-5xl">
              詳細リザルトを見る
            </Button>
          }
        />
      </div>
      <div className="mx-12 flex items-center justify-end gap-14" id="end_sub_buttons">
        <ModeChangeButton showAlert={Boolean(isRankingRegistration && !isSubmitRankingButtonDisabled)} />
        <RetryButton showAlert={Boolean(isRankingRegistration && !isSubmitRankingButtonDisabled)} />
      </div>
    </>
  );
};

const canRankingRegistration = ({
  session,
  status,
  bestScore,
  scene,
  minMediaSpeed,
}: {
  session: Session | null;
  status: { score: number; miss: number; lost: number };
  bestScore: number;
  scene: SceneType;
  minMediaSpeed: number;
}) => {
  if (!session || scene !== "play_end" || minMediaSpeed < 1 || status.score <= 0) return false;
  if (status.miss === 0 && status.lost === 0) return true;
  if (status.score >= bestScore) return true;
};

interface RetryButtonProps {
  showAlert: boolean;
}

const RetryButton = ({ showAlert }: RetryButtonProps) => {
  const scene = useSceneState();
  const buttonRef = useRef<HTMLButtonElement>(null);
  useHotkeys("F4", () => buttonRef.current?.click(), { enableOnFormTags: false, preventDefault: true });

  const handleRetry = async () => {
    const nextModeMap: Record<string, PlayMode> = {
      practice_end: "practice",
      replay_end: "replay",
      play_end: "play",
    };
    const nextMode = nextModeMap[scene] ?? "play";

    if (!showAlert) {
      commitPlayRestart(nextMode);
      return;
    }

    const isConfirmed = await confirmDialog.warning({
      title: "リトライ確認",
      description: "リトライすると今回の記録は失われますが、リトライしますか？",
      confirmLabel: "リトライ",
    });

    if (isConfirmed) {
      commitPlayRestart(nextMode);
    }
  };

  const buttonTextMap: Record<string, string> = {
    practice_end: "もう一度練習",
    replay_end: "もう一度リプレイ",
    play_end: "もう一度プレイ",
  };

  return (
    <Button
      ref={buttonRef}
      variant="outline"
      className="h-auto px-20 py-6 text-2xl max-sm:h-32 max-sm:w-md max-sm:text-5xl"
      onClick={handleRetry}
    >
      {buttonTextMap[scene] ?? "もう一度プレイ"}
    </Button>
  );
};

interface ModeChangeButtonProps {
  showAlert: boolean;
}

const ModeChangeButton = ({ showAlert }: ModeChangeButtonProps) => {
  const scene = useSceneState();
  const buttonRef = useRef<HTMLButtonElement>(null);
  useHotkeys("F7", () => buttonRef.current?.click(), { enableOnFormTags: false, preventDefault: true });

  const handleModeChange = async () => {
    const nextMode = scene === "play_end" ? "practice" : "play";
    if (!showAlert) {
      commitPlayRestart(nextMode);
      return;
    }

    const isConfirmed = await confirmDialog.warning({
      title: "リトライ確認",
      description: "リトライすると今回の記録は失われますが、リトライしますか？",
      confirmLabel: "リトライ",
    });

    if (isConfirmed) {
      commitPlayRestart(nextMode);
    }
  };

  return (
    <Button
      ref={buttonRef}
      variant="outline"
      className="h-auto px-20 py-6 text-2xl max-sm:h-32 max-sm:w-md max-sm:text-5xl"
      onClick={handleModeChange}
    >
      {scene === "play_end" ? "練習モードへ" : "本番モードへ"}
    </Button>
  );
};
