"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type z from "zod/v4";
import { readAllLineResult } from "@/app/(typing)/type/_lib/atoms/family";
import { readSubstatus } from "@/app/(typing)/type/_lib/atoms/ref";
import { readBuiltMap, readTypingStatus, setTabName } from "@/app/(typing)/type/_lib/atoms/state";
import { useConfirm } from "@/components/ui/alert-dialog/alert-dialog-provider";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/provider";
import { getMinValue } from "@/utils/array";
import type { CreateResultStatusSchema } from "@/validator/result";
import { readMapId, readTypingOptions } from "../../../_lib/atoms/hydrate";

interface RegisterRankingButtonProps {
  isScoreUpdated: boolean;
  disabled: boolean;
  onSuccess: () => void;
}

export const RegisterRankingButton = ({ isScoreUpdated, disabled, onSuccess }: RegisterRankingButtonProps) => {
  const confirm = useConfirm();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const sendResult = useMutation(
    trpc.result.createResult.mutationOptions({
      onSuccess: async () => {
        onSuccess();
        const mapId = readMapId();
        await queryClient.invalidateQueries(trpc.result.getMapRanking.queryOptions({ mapId: mapId ?? 0 }));
        setTabName("ランキング");
        toast.success("ランキング登録が完了しました");
      },
      onError: () => {
        toast.error("ランキング登録に失敗しました");
      },
    }),
  );

  const handleClick = async () => {
    const mapId = readMapId();
    if (!mapId) return;

    if (isScoreUpdated) {
      sendResult.mutate(generateResultData(mapId));
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
      sendResult.mutate(generateResultData(mapId));
    }
  };

  return (
    <Button
      size="4xl"
      variant="primary-hover-light"
      className="max-sm:text-5xl max-sm:h-40 max-sm:w-xl"
      disabled={disabled}
      loading={sendResult.isPending}
      onClick={handleClick}
    >
      {disabled ? "ランキング登録完了" : "ランキング登録"}
    </Button>
  );
};

const generateResultData = (mapId: number) => {
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
  const builtMap = readBuiltMap();
  const typingOptions = readTypingOptions();

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
    isCaseSensitive: builtMap?.isCaseSensitive || typingOptions.isCaseSensitive,
  };

  return {
    mapId,
    status: sendStatus,
    lineResults,
  };
};
