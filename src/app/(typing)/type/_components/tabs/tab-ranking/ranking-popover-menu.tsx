import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  setPlayingInputMode,
  setReplayRankingResult,
  setScene,
  setTabName,
  useSceneGroupState,
} from "@/app/(typing)/type/_lib/atoms/state";
import { Button } from "@/components/ui/button";
import { PopoverContent } from "@/components/ui/popover";
import { useGlobalLoadingOverlay } from "@/lib/atoms/global-atoms";
import { useToggleClapMutation } from "@/lib/mutations/clap";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/provider";
import { playYTPlayer, primeYTPlayerForMobilePlayback } from "../../../_lib/atoms/youtube-player";
import { getRankingResultByResultId } from "../../../_lib/get-ranking-result";
import { commitPlayRestart } from "../../../_lib/playing/commit-play-restart";
import { iosActiveSound } from "../../../_lib/playing/sound-effect";
import { queryResultJson } from "../../../_lib/query-result-json";

interface RankingMenuProps {
  resultId: number;
  userId: number;
  resultUpdatedAt: Date;
  hasClapped: boolean;
}

export const RankingPopoverContent = ({ resultId, userId, resultUpdatedAt, hasClapped }: RankingMenuProps) => {
  const { data: session } = useSession();
  const sceneGroup = useSceneGroupState();

  const trpc = useTRPC();
  const { id: mapId } = useParams<{ id: string }>();
  const { data: mapInfo } = useQuery(trpc.map.detail.getInfo.queryOptions({ mapId: Number(mapId) }));

  const toggleClap = useToggleClapMutation();
  const { showLoading, hideLoading } = useGlobalLoadingOverlay();

  const handleReplayClick = async () => {
    iosActiveSound();
    primeYTPlayerForMobilePlayback();
    showLoading({ message: "リザルトデータを読込中..." });
    setScene("replay");
    try {
      const resultData = await queryResultJson(resultId);
      const mode = resultData[0]?.status?.mode ?? "roma";
      setPlayingInputMode(mode);
      playYTPlayer();
    } catch {
      toast.error("リザルトデータの読み込みに失敗しました");
    } finally {
      hideLoading();
    }

    const mapUpdatedAt = mapInfo?.updatedAt;
    const resultUpdatedAtDate = new Date(resultUpdatedAt);

    if (mapUpdatedAt && mapUpdatedAt > resultUpdatedAtDate) {
      toast.warning("リプレイ登録時より後に譜面が更新されています", {
        description: "正常に再生できない可能性があります",
      });
    }

    setTabName("ステータス");

    const replayRankingResult = getRankingResultByResultId(resultId);
    setReplayRankingResult(replayRankingResult);

    if (sceneGroup === "End") {
      commitPlayRestart("replay");
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
    </PopoverContent>
  );
};
