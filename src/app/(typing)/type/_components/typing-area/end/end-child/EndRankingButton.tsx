"use client";

import { useSetTabName } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { useResultData } from "@/app/(typing)/type/_lib/hooks/end/useResultData";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTRPC } from "@/trpc/trpc";
import { useCustomToast } from "@/utils/global-hooks/useCustomToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import AlertDialogButton from "./child/AlertDialogButton";

interface EndRankingButtonProps {
  isScoreUpdated: boolean;
  isSendResultBtnDisabled: boolean;
  setIsSendResultBtnDisabled: (isDisabled: boolean) => void;
}

const EndRankingButton = ({
  isScoreUpdated,
  isSendResultBtnDisabled,
  setIsSendResultBtnDisabled,
}: EndRankingButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { id: mapId } = useParams();
  const setTabName = useSetTabName();
  const toast = useCustomToast();

  const resultData = useResultData();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const sendResult = useMutation(
    trpc.result.sendResult.mutationOptions({
      onSuccess: () => {
        setIsSendResultBtnDisabled(true);
        queryClient.invalidateQueries(trpc.ranking.getMapRanking.queryFilter({ mapId: Number(mapId) }));
        setIsDialogOpen(false);
        setTabName("ランキング");
        toast({ type: "success", title: "ランキング登録が完了しました" });
      },
      onError: () => {
        setIsSendResultBtnDisabled(false);
      },
    }),
  );

  const handleSubmitResult = () => {
    sendResult.mutate(resultData());
  };

  const handleClick = async () => {
    if (!isScoreUpdated) {
      setIsDialogOpen(true);
    } else {
      handleSubmitResult();
    }
  };

  return (
    <>
      <ScoreDowngradeDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleSubmitResult}
        isLoading={sendResult.isPending}
      />
      <Button
        size="4xl"
        variant="primary-hover-light"
        disabled={isSendResultBtnDisabled}
        loading={sendResult.isPending}
        onClick={handleClick}
        type={isScoreUpdated ? "submit" : "button"}
      >
        {isSendResultBtnDisabled ? "ランキング登録完了" : "ランキング登録"}
      </Button>
    </>
  );
};

interface ScoreDowngradeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const ScoreDowngradeDialog = ({ isOpen, onOpenChange, onConfirm, isLoading }: ScoreDowngradeDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>スコア未更新</DialogTitle>
          <DialogDescription>ランキング登録済みのスコアから下がりますが、ランキングに登録しますか？</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <AlertDialogButton onClick={onConfirm} isLoading={isLoading} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EndRankingButton;
