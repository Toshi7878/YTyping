import { useGameUtilityReferenceParams } from "@/app/(typing)/type/_lib/atoms/refAtoms";
import { useMapInfoRef, useSceneGroupState, useSetTabName } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { useRetry } from "@/app/(typing)/type/_lib/hooks/playing/retry";
import { useSoundEffect } from "@/app/(typing)/type/_lib/hooks/playing/soundEffect";
import { useResultPlay } from "@/app/(typing)/type/_lib/hooks/resultPlay";
import { Button } from "@/components/ui/button";
import { PopoverContent } from "@/components/ui/popover";
import { LocalClapState } from "@/types";
import { useClapMutationRanking } from "@/utils/mutations/clap.mutations";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface RankingMenuProps {
  resultId: number;
  userId: number;
  resultUpdatedAt: Date;
  name: string;
  clapOptimisticState: LocalClapState;
  onOpenChange?: (open: boolean) => void;
}
const RankingPopoverContent = ({
  resultId,
  userId,
  resultUpdatedAt,
  name,
  clapOptimisticState,
  onOpenChange,
}: RankingMenuProps) => {
  const { data: session } = useSession();
  const sceneGroup = useSceneGroupState();
  const { iosActiveSound } = useSoundEffect();
  const retry = useRetry();
  const resultPlay = useResultPlay({ startMode: "replay" });
  const setTabName = useSetTabName();

  const { writeGameUtilRefParams } = useGameUtilityReferenceParams();
  const { readMapInfo } = useMapInfoRef();
  const { id: mapIdParam } = useParams<{ id: string }>();
  const mapId = Number(mapIdParam);

  const toggleClap = useClapMutationRanking(mapId);

  const handleReplayClick = async () => {
    await resultPlay(resultId);

    const mapUpdatedAt = readMapInfo().updated_at;
    const resultUpdatedAtDate = new Date(resultUpdatedAt);
    iosActiveSound();

    if (mapUpdatedAt > resultUpdatedAtDate) {
      toast.warning("リプレイ登録時より後に譜面が更新されています", {
        description: "正常に再生できない可能性があります",
      });
    }

    onOpenChange?.(false);
    setTabName("ステータス");
    writeGameUtilRefParams({
      replayUserName: name,
    });

    if (sceneGroup === "End") {
      retry("replay");
    }
  };

  return (
    <PopoverContent side="bottom" align="start" className="flex w-fit flex-col items-center">
      <Button variant="ghost" className="w-full">
        <Link href={`/user/${userId}`}>ユーザーページへ </Link>
      </Button>

      <Button
        variant="ghost"
        className="w-full"
        onClick={() => handleReplayClick()}
        disabled={sceneGroup === "Playing"}
      >
        リプレイ再生
      </Button>
      {session?.user.id ? (
        <Button
          variant="ghost"
          type="button"
          className="w-full"
          onClick={() => toggleClap.mutate({ resultId, optimisticState: !clapOptimisticState.hasClap })}
        >
          {clapOptimisticState.hasClap ? "拍手済み" : "記録に拍手"}
        </Button>
      ) : null}
    </PopoverContent>
  );
};

export default RankingPopoverContent;
