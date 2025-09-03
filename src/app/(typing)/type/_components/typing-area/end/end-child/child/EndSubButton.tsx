import { Button } from "@/components/ui/button";

import { useSceneState } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { useRetry } from "@/app/(typing)/type/_lib/hooks/playing-hooks/retry";
import { PlayMode } from "@/app/(typing)/type/_lib/type";
import { useConfirm } from "@/components/ui/alert-dialog/alert-dialog-provider";

interface EndSubButtonProps {
  retryMode: PlayMode;
  isRetryAlert: boolean;
  retryBtnRef: React.RefObject<HTMLButtonElement | null>;
}

const RetryButton = ({ isRetryAlert, retryMode, retryBtnRef }: EndSubButtonProps) => {
  const scene = useSceneState();
  const retry = useRetry();
  const confirm = useConfirm();

  const handleRetry = async () => {
    if (!isRetryAlert) {
      retry(retryMode);
      return;
    }

    const isConfirmed = await confirm({
      title: "リトライ確認",
      body: "リトライすると今回の記録は失われますが、リトライしますか？",
      cancelButton: "キャンセル",
      actionButton: "リトライ",
      cancelButtonVariant: "outline",
      actionButtonVariant: "warning-dark",
    });

    if (isConfirmed) {
      retry(retryMode);
    }
  };

  const getButtonText = () => {
    if (retryMode === "practice" && scene !== "practice_end") return "練習モードへ";
    if (retryMode === "play" && scene !== "play_end") return "本番モードへ";
    if (retryMode === "practice") return "もう一度練習";
    if (retryMode === "replay") return "もう一度リプレイ";
    if (retryMode === "play") return "もう一度プレイ";
  };

  return (
    <>
      <Button
        ref={retryBtnRef}
        variant="outline"
        className="h-auto border-white px-20 py-6 text-2xl text-white"
        onClick={handleRetry}
      >
        {getButtonText()}
      </Button>
    </>
  );
};

export default RetryButton;
