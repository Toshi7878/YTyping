"use client";

import { useSetTabName } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { useResultData } from "@/app/(typing)/type/_lib/hooks/end/useResultData";
import { useConfirm } from "@/components/ui/alert-dialog/alert-dialog-provider";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";

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
  const { id: mapId } = useParams<{ id: string }>();
  const setTabName = useSetTabName();
  const confirm = useConfirm();

  const resultData = useResultData();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const sendResult = useMutation(
    trpc.result.sendResult.mutationOptions({
      onSuccess: async () => {
        setIsSendResultBtnDisabled(true);
        await queryClient.invalidateQueries(trpc.ranking.getMapRanking.queryOptions({ mapId: Number(mapId) }));
        setTabName("ランキング");
        toast.success("ランキング登録が完了しました");
      },
      onError: (error) => {
        setIsSendResultBtnDisabled(false);
      },
    }),
  );

  const submitResult = () => {
    const result = resultData();
    if (!result) return;
    sendResult.mutate(result);
  };

  const handleClick = async () => {
    if (isScoreUpdated) {
      submitResult();
      return;
    }

    const isConfirmed = await confirm({
      title: "スコア未更新",
      body: "ランキング登録済みのスコアから下がりますが、ランキングに登録しますか？",
      cancelButton: "キャンセル",
      actionButton: "ランキングに登録",
      cancelButtonVariant: "outline",
      actionButtonVariant: "warning",
    });

    if (isConfirmed) {
      submitResult();
    }
  };

  return (
    <>
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

export default EndRankingButton;
