import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

import { useSceneState } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { useRetry } from "@/app/(typing)/type/_lib/hooks/playing-hooks/retry";
import { PlayMode } from "@/app/(typing)/type/_lib/type";

interface EndSubButtonProps {
  retryMode: PlayMode;
  isRetryAlert: boolean;
  retryBtnRef: React.RefObject<HTMLButtonElement | null>;
}

const RetryButton = ({ isRetryAlert, retryMode, retryBtnRef }: EndSubButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const scene = useSceneState();
  const retry = useRetry();

  const handleRetry = () => {
    if (isRetryAlert) {
      setIsOpen(true);
    } else {
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
      <RetryAlertDialog isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};

const RetryAlertDialog = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (isOpen: boolean) => void }) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>リトライ確認</DialogTitle>
          <DialogDescription asChild>
            <div>
              <div>ランキング登録が完了していませんが、リトライしますか？</div>
              <div>※リトライすると今回の記録は失われます</div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default RetryButton;
