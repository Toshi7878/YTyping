"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { readAllLineResult } from "@/app/(typing)/type/_lib/atoms/family";
import { readTypingSubstatus, type TypingSubstatus } from "@/app/(typing)/type/_lib/atoms/ref";
import { type BuiltMap, readBuiltMap, setTabName } from "@/app/(typing)/type/_lib/atoms/state";
import { useRegisterRankingMutation } from "@/app/(typing)/type/_lib/mutate/register-ranking";
import { Button } from "@/components/ui/button";
import { confirmDialog } from "@/components/ui/confirm-dialog";
import { useTRPC } from "@/trpc/provider";
import type { TypingLineResult } from "@/validator/result";
import { readMapId, readTypingOptions, type TypingOptions } from "../../../_lib/atoms/hydrate";
import { readTypingStatus, type TypingStatus } from "../../../_lib/atoms/status";

interface RegisterRankingButtonProps {
  showAlert: boolean;
  disabled: boolean;
  onSuccess: () => void;
}

export const RegisterRankingButton = ({ showAlert, disabled, onSuccess }: RegisterRankingButtonProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const registerRanking = useRegisterRankingMutation({
    onSuccess: async () => {
      onSuccess();
      const mapId = readMapId();
      await queryClient.invalidateQueries(trpc.result.list.getRanking.queryOptions({ mapId: mapId ?? 0 }));
      setTabName("ランキング");
      toast.success("ランキング登録が完了しました");
    },
    onError: () => {
      toast.error("ランキング登録に失敗しました");
    },
  });

  const handleClick = async () => {
    const mapId = readMapId();
    if (!mapId) return;

    const isConfirmed = showAlert
      ? true
      : await confirmDialog.warning({
          title: "スコア未更新",
          description: "ランキング登録済みのスコアから下がりますが、ランキングに登録しますか？",
          confirmLabel: "ランキングに登録",
        });

    if (isConfirmed) {
      const typingSubStatus = readTypingSubstatus();
      const lineResults = readAllLineResult();
      const typingStatus = readTypingStatus();
      const builtMap = readBuiltMap();
      const typingOptions = readTypingOptions();

      registerRanking.mutate({
        mapId,
        status: buildResultData(typingSubStatus, lineResults, typingStatus, builtMap, typingOptions),
        lineResults,
      });
    }
  };

  return (
    <Button
      size="4xl"
      variant="primary-hover-light"
      className="max-sm:h-40 max-sm:w-xl max-sm:text-5xl"
      disabled={disabled}
      loading={registerRanking.isPending}
      onClick={handleClick}
    >
      {disabled ? "ランキング登録完了" : "ランキング登録"}
    </Button>
  );
};

const buildResultData = (
  typingSubStatus: TypingSubstatus,
  lineResults: TypingLineResult[],
  typingStatus: TypingStatus,
  builtMap: BuiltMap,
  typingOptions: TypingOptions,
) => {
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
  } = typingSubStatus;
  const minPlaySpeed = Math.min(...lineResults.flatMap(({ status }) => (status?.typingTime ? [status.speed] : [])));
  const rkpmTime = totalTypeTime - totalLatency;

  return {
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
    isCaseSensitive: !!builtMap?.hasAlphabet && (builtMap.isCaseSensitive || typingOptions.isCaseSensitive),
  };
};
