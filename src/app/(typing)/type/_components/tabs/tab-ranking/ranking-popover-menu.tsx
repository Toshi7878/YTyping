import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { setReplayUserName, setTabName, useSceneGroupState } from "@/app/(typing)/type/_lib/atoms/state";
import { Button } from "@/components/ui/button";
import { PopoverContent } from "@/components/ui/popover";
import { useClapMutationRanking } from "@/lib/mutations/clap.mutations";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/provider";
import { commitPlayRestart } from "../../../_lib/playing/commit-play-restart";
import { iosActiveSound } from "../../../_lib/playing/sound-effect";
import { useLoadResultAndStartPlay } from "../../../_lib/ready/use-load-result-and-start-play";

interface RankingMenuProps {
  resultId: number;
  userId: number;
  resultUpdatedAt: Date;
  name: string;
  hasClapped: boolean;
}

export const RankingPopoverContent = ({ resultId, userId, resultUpdatedAt, name, hasClapped }: RankingMenuProps) => {
  const { data: session } = useSession();
  const sceneGroup = useSceneGroupState();
  const resultPlay = useLoadResultAndStartPlay({ startMode: "replay" });

  const trpc = useTRPC();
  const { id: mapId } = useParams<{ id: string }>();
  const { data: mapInfo } = useQuery(trpc.map.getMapInfo.queryOptions({ mapId: Number(mapId) }));

  const toggleClap = useClapMutationRanking(Number(mapId));

  const handleReplayClick = async () => {
    await resultPlay(resultId);

    const mapUpdatedAt = mapInfo?.updatedAt;
    const resultUpdatedAtDate = new Date(resultUpdatedAt);
    iosActiveSound();

    if (mapUpdatedAt && mapUpdatedAt > resultUpdatedAtDate) {
      toast.warning("リプレイ登録時より後に譜面が更新されています", {
        description: "正常に再生できない可能性があります",
      });
    }

    setTabName("ステータス");
    setReplayUserName(name);

    if (sceneGroup === "End") {
      commitPlayRestart("replay");
    }
  };

  return (
    <PopoverContent
      side="bottom"
      align="start"
      className="flex w-fit flex-col items-center px-0 py-2 [&>button]:w-full"
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
          className={cn(hasClapped && "hover:text-perfect text-perfect outline-text")}
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
