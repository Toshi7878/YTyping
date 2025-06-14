import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

import { useSceneState } from "@/app/(typing)/type/atoms/stateAtoms";
import { useRetry } from "@/app/(typing)/type/hooks/playing-hooks/retry";
import { PlayMode } from "@/app/(typing)/type/ts/type";

interface EndSubButtonProps {
  retryMode: PlayMode;
  isRetryAlert: boolean;
  retryBtnRef: React.RefObject<HTMLButtonElement>;
}

const EndSubButton = ({ isRetryAlert, retryMode, retryBtnRef }: EndSubButtonProps) => {
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
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setIsOpen(false);
                retry(retryMode);
              }}
            >
              リトライ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button
        ref={retryBtnRef}
        variant="outline"
        className="px-20 py-6 text-2xl h-auto border-white text-white"
        onClick={handleRetry}
      >
        {getButtonText()}
      </Button>
    </>
  );
};

export default EndSubButton;
