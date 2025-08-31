"use client";

import { useSetTabName } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { useResultData } from "@/app/(typing)/type/_lib/hooks/end/useResultData";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/provider";
import { useCustomToast } from "@/utils/global-hooks/useCustomToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";

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
    const result = resultData();
    if (!result) return;
    sendResult.mutate(result);
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
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>スコア未更新</AlertDialogTitle>
          <AlertDialogDescription>
            ランキング登録済みのスコアから下がりますが、ランキングに登録しますか？
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button variant="warning-dark" onClick={onConfirm} loading={isLoading}>
            ランキングに登録
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EndRankingButton;
