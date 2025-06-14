"use client";

import { useSetTabIndex } from "@/app/(typing)/type/atoms/stateAtoms";
import { useResultData } from "@/app/(typing)/type/hooks/end/useResultData";
import { useTRPC } from "@/trpc/trpc";
import { useCustomToast } from "@/utils/global-hooks/useCustomToast";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import AlertDialogButton from "./child/AlertDialogButton";
import EndMainButton from "./child/EndMainButton";

interface UploadButtonProps {
  isScoreUpdated: boolean;
  isSendResultBtnDisabled: boolean;
  setIsSendResultBtnDisabled: (isDisabled: boolean) => void;
}

const EndUploadButton = ({
  isScoreUpdated,
  isSendResultBtnDisabled,
  setIsSendResultBtnDisabled,
}: UploadButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { id: mapId } = useParams();
  const setTabIndex = useSetTabIndex();
  const toast = useCustomToast();

  const resultData = useResultData();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const sendResult = useMutation(
    trpc.result.sendResult.mutationOptions({
      onSuccess: () => {
        setIsSendResultBtnDisabled(true);
        queryClient.invalidateQueries(trpc.ranking.getMapRanking.queryFilter({ mapId: Number(mapId) }));
        setIsOpen(false);
        setTabIndex(1);
        toast({ type: "success", title: "ランキング登録が完了しました" });
      },
      onError: () => {
        setIsSendResultBtnDisabled(false);
      },
    }),
  );

  const handleClick = async () => {
    if (!isScoreUpdated) {
      setIsOpen(true);
    } else {
      sendResult.mutate(resultData());
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>スコア未更新</DialogTitle>
            <DialogDescription>
              ランキング登録済みのスコアから下がりますが、ランキングに登録しますか？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              キャンセル
            </Button>
            <AlertDialogButton onClick={() => sendResult.mutate(resultData())} isLoading={sendResult.isPending} />
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <EndMainButton
        disabled={isSendResultBtnDisabled}
        onClick={handleClick}
        type={isScoreUpdated ? "submit" : "button"}
      >
        {isSendResultBtnDisabled ? "ランキング登録完了" : "ランキング登録"}
      </EndMainButton>
    </>
  );
};

export default EndUploadButton;
