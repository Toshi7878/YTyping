"use client";

import { useSetTabName } from "@/app/(typing)/type/_lib/atoms/state-atoms";
import { useResultData } from "@/app/(typing)/type/_lib/hooks/end/use-result-data";
import { useConfirm } from "@/components/ui/alert-dialog/alert-dialog-provider";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface SubmitRankingButtonProps {
  isScoreUpdated: boolean;
  isSendResultBtnDisabled: boolean;
  setIsSendResultBtnDisabled: (isDisabled: boolean) => void;
}

const SubmitRankingButton = ({
  isScoreUpdated,
  isSendResultBtnDisabled,
  setIsSendResultBtnDisabled,
}: SubmitRankingButtonProps) => {
  const { id: mapId } = useParams<{ id: string }>();
  const setTabName = useSetTabName();
  const confirm = useConfirm();

  const resultData = useResultData();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const sendResult = useMutation(
    trpc.result.createResult.mutationOptions({
      onSuccess: async () => {
        setIsSendResultBtnDisabled(true);
        await queryClient.invalidateQueries(trpc.result.getMapRanking.queryOptions({ mapId: Number(mapId) }));
        setTabName("ランキング");
        toast.success("ランキング登録が完了しました");
      },
      onError: () => {
        setIsSendResultBtnDisabled(false);
        toast.error("ランキング登録に失敗しました");
      },
    }),
  );

  const handleClick = async () => {
    if (isScoreUpdated) {
      const result = resultData();
      sendResult.mutate(result);
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
      const result = resultData();
      sendResult.mutate(result);
    }
  };

  return (
    <Button
      size="4xl"
      variant="primary-hover-light"
      disabled={isSendResultBtnDisabled}
      loading={sendResult.isPending}
      onClick={handleClick}
    >
      {isSendResultBtnDisabled ? "ランキング登録完了" : "ランキング登録"}
    </Button>
  );
};

export default SubmitRankingButton;
