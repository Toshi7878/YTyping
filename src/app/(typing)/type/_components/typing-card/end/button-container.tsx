import { useSession } from "next-auth/react";
import { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { usePlaySpeedState } from "@/app/(typing)/type/_lib/atoms/speed-reducer";
import { setLineResultSheet, useSceneState, useTypingStatusState } from "@/app/(typing)/type/_lib/atoms/state";
import { getRankingMyResult } from "@/app/(typing)/type/_lib/get-ranking-my-result";
import { commitPlayRestart } from "@/app/(typing)/type/_lib/playing/commit-play-restart";
import type { PlayMode } from "@/app/(typing)/type/_lib/type";
import { useConfirm } from "@/components/ui/alert-dialog/alert-dialog-provider";
import { Button } from "@/components/ui/button";
import { RegisterRankingButton } from "./submit-ranking-button";

export const EndButtonContainer = () => {
  const { data: session } = useSession();
  const speed = usePlaySpeedState();
  const status = useTypingStatusState();
  const scene = useSceneState();
  const [isSubmitRankingButtonDisabled, setIsSubmitRankingButtonDisabled] = useState(false);
  const [bestScore] = useState(() => getRankingMyResult(session)?.score ?? 0);

  const isPerfect = status.miss === 0 && status.lost === 0;
  const isScoreUpdated = status.score >= bestScore && status.score > 0;
  const isDisplayRankingButton =
    !!session && (isScoreUpdated || isPerfect) && speed.minPlaySpeed >= 1 && scene === "play_end";
  return (
    <>
      <div className="flex items-center justify-around" id="end_main_buttons">
        {isDisplayRankingButton && (
          <RegisterRankingButton
            isScoreUpdated={isScoreUpdated}
            disabled={isSubmitRankingButtonDisabled}
            onSuccess={() => setIsSubmitRankingButtonDisabled(true)}
          />
        )}
        <LineResultButton />
      </div>
      <div className="mx-12 flex items-center justify-end gap-14" id="end_sub_buttons">
        <ModeChangeButton showAlert={Boolean(isDisplayRankingButton && !isSubmitRankingButtonDisabled)} />
        <RetryButton showAlert={Boolean(isDisplayRankingButton && !isSubmitRankingButtonDisabled)} />
      </div>
    </>
  );
};

const LineResultButton = () => {
  return (
    <Button
      size="4xl"
      variant="primary-hover-light"
      className="max-sm:text-5xl max-sm:h-40 max-sm:w-xl"
      onClickCapture={(event) => {
        event.stopPropagation();
        setLineResultSheet((prev) => !prev);
      }}
    >
      詳細リザルトを見る
    </Button>
  );
};

interface RetryButtonProps {
  showAlert: boolean;
}

const RetryButton = ({ showAlert }: RetryButtonProps) => {
  const scene = useSceneState();
  const confirm = useConfirm();
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

    const isConfirmed = await confirm({
      title: "リトライ確認",
      body: "リトライすると今回の記録は失われますが、リトライしますか？",
      cancelButton: "キャンセル",
      actionButton: "リトライ",
      cancelButtonVariant: "outline",
      actionButtonVariant: "warning",
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
      className="max-sm:text-5xl max-sm:h-32 max-sm:w-md h-auto px-20 py-6 text-2xl"
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
  const confirm = useConfirm();
  const buttonRef = useRef<HTMLButtonElement>(null);
  useHotkeys("F7", () => buttonRef.current?.click(), { enableOnFormTags: false, preventDefault: true });

  const handleModeChange = async () => {
    const nextMode = scene === "play_end" ? "practice" : "play";
    if (!showAlert) {
      commitPlayRestart(nextMode);
      return;
    }

    const isConfirmed = await confirm({
      title: "リトライ確認",
      body: "リトライすると今回の記録は失われますが、リトライしますか？",
      cancelButton: "キャンセル",
      actionButton: "リトライ",
      cancelButtonVariant: "outline",
      actionButtonVariant: "warning",
    });

    if (isConfirmed) {
      commitPlayRestart(nextMode);
    }
  };

  return (
    <Button
      ref={buttonRef}
      variant="outline"
      className="max-sm:text-5xl max-sm:h-32 max-sm:w-md h-auto px-20 py-6 text-2xl"
      onClick={handleModeChange}
    >
      {scene === "play_end" ? "練習モードへ" : "本番モードへ"}
    </Button>
  );
};
