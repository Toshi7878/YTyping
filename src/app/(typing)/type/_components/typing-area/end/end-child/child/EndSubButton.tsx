import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
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
      <RetryAlertDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onConfirm={() => {
          setIsOpen(false);
          retry(retryMode);
        }}
      />
    </>
  );
};

const RetryAlertDialog = ({
  isOpen,
  setIsOpen,
  onConfirm,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onConfirm: () => void;
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>リトライ確認</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-1">
              <p>ランキング登録が完了していませんが、リトライしますか？</p>
              <p className="text-sm font-medium">※リトライすると今回の記録は失われます</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            キャンセル
          </Button>
          <Button variant="warning-dark" onClick={onConfirm}>
            リトライ
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RetryButton;
