import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { setTabName } from "@/app/(typing)/type/_feature/tabs/tabs";
import { useSession } from "@/auth/client";
import { orpc } from "@/orpc/provider";
import { useToggleClapMutation } from "@/shared/result/clap";
import { Button } from "@/ui/button";
import { confirmDialog } from "@/ui/confirm-dialog";
import { overlay } from "@/ui/overlay";
import { PopoverContent } from "@/ui/popover";
import { toast } from "@/ui/toast";
import { cn } from "@/utils/cn";
import { setInitialLineResults } from "../../atoms/line-results";
import { setReplayRankingResult } from "../../atoms/replay";
import { setPlayingInputMode } from "../../atoms/typing-word";
import { playYTPlayer, primeYTPlayerForMobilePlayback } from "../../atoms/youtube-player";
import { restartPlay } from "../../lib/play-restart";
import { iosActiveSound } from "../../lib/sound-effect";
import { getMapId } from "../../provider";
import { setScene, useSceneGroupState } from "../../typing-card/typing-card";
import { dispatchTypeEvent } from "../../user-script";
import { getRankingResultByResultId } from "./get-ranking-result";

interface RankingMenuProps {
  resultId: number;
  userId: number;
  resultUpdatedAt: Date;
  hasClapped: boolean;
}

export const RankingPopoverContent = ({ resultId, userId, resultUpdatedAt, hasClapped }: RankingMenuProps) => {
  const { data: session } = useSession();
  const sceneGroup = useSceneGroupState();
  const queryClient = useQueryClient();
  const { id: mapId } = useParams<{ id: string }>();
  const { data: mapInfo } = useQuery(orpc.map.getById.queryOptions({ input: { mapId: Number(mapId) } }));

  const toggleClap = useToggleClapMutation();

  const invalidateResult = useMutation(
    orpc.result.invalidation.invalidate.mutationOptions({
      onSuccess: async () => {
        toast.success("この記録をBANしました");
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpc.result.ranking.get.queryKey({ input: { mapId: Number(mapId) } }),
          }),
          queryClient.invalidateQueries({ queryKey: orpc.result.list.key() }),
          queryClient.invalidateQueries({ queryKey: orpc.map.list.key() }),
        ]);
      },
      onError: (error) => toast.error(`BANに失敗しました: ${error.message}`),
    }),
  );

  const handleInvalidateClick = async () => {
    const confirmed = await confirmDialog.danger({
      title: "この記録をBANしますか？",
      description:
        "この記録を無効な記録としてマークします。ランキングと他のユーザーの記録一覧に表示されなくなり、PPにも反映されません。ユーザー自身のBANではありません。",
      confirmLabel: "BANする",
    });
    if (confirmed) invalidateResult.mutate({ resultId });
  };

  const handleReplayClick = async () => {
    iosActiveSound();
    primeYTPlayerForMobilePlayback();
    overlay.loading("リザルトデータを読込中...");
    setScene("replay");
    try {
      const resultData = await queryClient.ensureQueryData(
        orpc.result.getJsonById.queryOptions({ input: { resultId } }),
      );
      setInitialLineResults(resultData);
      const mode = resultData[0]?.status?.mode ?? "roma";
      setPlayingInputMode(mode);
      dispatchTypeEvent("change-input-mode", { newInputMode: mode });
      playYTPlayer();
    } catch {
      toast.error("リザルトデータの読み込みに失敗しました");
    } finally {
      overlay.hide();
    }

    const mapUpdatedAt = mapInfo?.updatedAt;
    const resultUpdatedAtDate = new Date(resultUpdatedAt);

    if (mapUpdatedAt && mapUpdatedAt > resultUpdatedAtDate) {
      toast.warning("リプレイ登録時より後に譜面が更新されています", {
        description: "正常に再生できない可能性があります",
      });
    }

    setTabName("ステータス");

    const mapId = getMapId();
    const replayRankingResult = mapId ? getRankingResultByResultId({ mapId, resultId }) : null;
    setReplayRankingResult(replayRankingResult);

    if (sceneGroup === "End") {
      restartPlay("replay");
    }
  };

  return (
    <PopoverContent
      side="bottom"
      align="start"
      className="flex w-fit flex-col items-center px-0 py-2 sm:w-fit [&>button]:w-full"
    >
      <Button variant="ghost">
        <Link href={`/user/${userId}`}>ユーザーページへ </Link>
      </Button>

      <Button variant="ghost" onClick={handleReplayClick} disabled={sceneGroup === "Playing"}>
        リプレイ再生
      </Button>
      {session ? (
        <Button
          variant="ghost"
          type="button"
          className={cn(hasClapped && "text-perfect outline-text hover:text-perfect")}
          onClick={(e) => {
            e.stopPropagation();
            toggleClap.mutate({ resultId, newState: !hasClapped });
          }}
        >
          {hasClapped ? "拍手済み" : "記録に拍手"}
        </Button>
      ) : null}
      {session?.user.role === "ADMIN" ? (
        <Button
          variant="ghost"
          type="button"
          className="text-destructive hover:text-destructive"
          disabled={invalidateResult.isPending}
          onClick={(e) => {
            e.stopPropagation();
            void handleInvalidateClick();
          }}
        >
          この記録をBAN
        </Button>
      ) : null}
    </PopoverContent>
  );
};
