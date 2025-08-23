import { useGameUtilityReferenceParams } from "@/app/(typing)/type/_lib/atoms/refAtoms";
import { useMapInfoRef, useSceneGroupState, useSetTabName } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { useRetry } from "@/app/(typing)/type/_lib/hooks/playing-hooks/retry";
import { useSoundEffect } from "@/app/(typing)/type/_lib/hooks/playing-hooks/soundEffect";
import { useResultPlay } from "@/app/(typing)/type/_lib/hooks/resultPlay";
import { Button } from "@/components/ui/button";
import Link from "@/components/ui/link/link";
import { PopoverContent } from "@/components/ui/popover";
import { INITIAL_STATE } from "@/config/globalConst";
import { LocalClapState, UploadResult } from "@/types";
import { useCustomToast } from "@/utils/global-hooks/useCustomToast";
import { useSession } from "next-auth/react";
import { useActionState } from "react";

interface RankingMenuProps {
  resultId: number;
  userId: number;
  resultUpdatedAt: Date;
  name: string;
  clapOptimisticState: LocalClapState;
  toggleClapAction: (resultId: number) => Promise<UploadResult>;
  onOpenChange?: (open: boolean) => void;
}
const RankingPopoverContent = ({
  resultId,
  userId,
  resultUpdatedAt,
  name,
  clapOptimisticState,
  toggleClapAction,
  onOpenChange,
}: RankingMenuProps) => {
  const { data: session } = useSession();
  const sceneGroup = useSceneGroupState();
  const toast = useCustomToast();
  const { iosActiveSound } = useSoundEffect();
  const retry = useRetry();
  const resultPlay = useResultPlay({ startMode: "replay" });
  const setTabName = useSetTabName();

  const { writeGameUtilRefParams } = useGameUtilityReferenceParams();
  const { readMapInfo } = useMapInfoRef();
  const handleReplayClick = async () => {
    await resultPlay(resultId);

    const mapUpdatedAt = readMapInfo().updated_at;
    const resultUpdatedAtDate = new Date(resultUpdatedAt);
    iosActiveSound();

    if (mapUpdatedAt > resultUpdatedAtDate) {
      toast({
        type: "warning",
        title: "リプレイ登録時より後に譜面が更新されています",
        message: "正常に再生できない可能性があります",
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

  const [state, formAction] = useActionState(async () => {
    const result = await toggleClapAction(resultId);

    return result;
  }, INITIAL_STATE);
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
        <form action={formAction} className="w-full">
          <Button variant="ghost" type="submit" className="w-full">
            {clapOptimisticState.hasClap ? "拍手済み" : "記録に拍手"}
          </Button>
        </form>
      ) : null}
    </PopoverContent>
  );
};

export default RankingPopoverContent;
