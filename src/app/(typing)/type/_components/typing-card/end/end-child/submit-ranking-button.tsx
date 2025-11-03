"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import type z from "zod/v4";
import { readAllLineResult } from "@/app/(typing)/type/_lib/atoms/family";
import { readSubstatus } from "@/app/(typing)/type/_lib/atoms/ref";
import { readTypingStatus, setTabName } from "@/app/(typing)/type/_lib/atoms/state";
import { useConfirm } from "@/components/ui/alert-dialog/alert-dialog-provider";
import { Button } from "@/components/ui/button";
import type { CreateResultStatusSchema } from "@/server/drizzle/validator/result";
import { useTRPC } from "@/trpc/provider";
import { getMinValue } from "@/utils/array";

interface SubmitRankingButtonProps {
  isScoreUpdated: boolean;
  isSendResultBtnDisabled: boolean;
  setIsSendResultBtnDisabled: (isDisabled: boolean) => void;
}

export const SubmitRankingButton = ({
  isScoreUpdated,
  isSendResultBtnDisabled,
  setIsSendResultBtnDisabled,
}: SubmitRankingButtonProps) => {
  const { id: mapId } = useParams<{ id: string }>();
  const confirm = useConfirm();

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
      sendResult.mutate(parseResultData(mapId));
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
      sendResult.mutate(parseResultData(mapId));
    }
  };

  return (
    <Button
      size="4xl"
      variant="primary-hover-light"
      className="max-sm:text-5xl max-sm:h-40 max-sm:w-xl"
      disabled={isSendResultBtnDisabled}
      loading={sendResult.isPending}
      onClick={handleClick}
    >
      {isSendResultBtnDisabled ? "ランキング登録完了" : "ランキング登録"}
    </Button>
  );
};

const parseResultData = (mapId: string) => {
  const {
    totalTypeTime,
    totalLatency,
    kanaToRomaConvertCount,
    clearRate,
    romaType,
    kanaType,
    flickType,
    englishType,
    spaceType,
    symbolType,
    numType,
    maxCombo,
  } = readSubstatus();

  const lineResults = readAllLineResult();

  const minPlaySpeed = getMinValue(lineResults.flatMap(({ status }) => (status?.tTime ? [status.sp] : [])));

  const rkpmTime = totalTypeTime - totalLatency;
  const typingStatus = readTypingStatus();

  const sendStatus: z.output<typeof CreateResultStatusSchema> = {
    score: typingStatus.score,
    rkpm: Math.floor((typingStatus.type / rkpmTime) * 60),
    kpm: typingStatus.kpm,
    miss: typingStatus.miss,
    lost: typingStatus.lost,
    romaType,
    kanaType,
    flickType,
    englishType,
    spaceType,
    symbolType,
    numType,
    maxCombo,
    minPlaySpeed,
    kanaToRomaKpm: Math.floor((kanaToRomaConvertCount / totalTypeTime) * 60),
    kanaToRomaRkpm: Math.floor((kanaToRomaConvertCount / rkpmTime) * 60),
    clearRate: Number(Math.max(0, clearRate).toFixed(1)),
  };

  return {
    mapId: Number(mapId),
    status: sendStatus,
    lineResults,
  };
};
