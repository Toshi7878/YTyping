import { useGameUtilityReferenceParams } from "@/app/(typing)/type/_lib/atoms/refAtoms";
import { useMapInfoRef, useSceneGroupState, useSetTabName } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { useLoadResultPlay } from "@/app/(typing)/type/_lib/hooks/loadResultPlay";
import { useRetry } from "@/app/(typing)/type/_lib/hooks/playing-hooks/retry";
import { useSoundEffect } from "@/app/(typing)/type/_lib/hooks/playing-hooks/soundEffect";
import { Button } from "@/components/ui/button";
import { LocalClapState, UploadResult } from "@/types";
import { useCustomToast } from "@/utils/global-hooks/useCustomToast";
import { useSession } from "next-auth/react";
import { Dispatch } from "react";
import MenuClapButton from "./child/MenuClapButton";

interface RankingMenuProps {
  resultId: number;
  userId: number;
  resultUpdatedAt: Date;
  name: string;
  setShowMenu: Dispatch<number | null>;
  setHoveredIndex: Dispatch<number | null>;
  clapOptimisticState: LocalClapState;
  toggleClapAction: (resultId: number) => Promise<UploadResult>;
}
const RankingMenu = ({
  resultId,
  userId,
  resultUpdatedAt,
  name,
  setShowMenu,
  setHoveredIndex,
  clapOptimisticState,
  toggleClapAction,
}: RankingMenuProps) => {
  const { data: session } = useSession();
  const sceneGroup = useSceneGroupState();
  const toast = useCustomToast();
  const { iosActiveSound } = useSoundEffect();
  const retry = useRetry();
  const loadResultPlay = useLoadResultPlay({ startMode: "replay", resultId });
  const setTabName = useSetTabName();

  const { writeGameUtilRefParams } = useGameUtilityReferenceParams();
  const { readMapInfo } = useMapInfoRef();
  const handleReplayClick = async () => {
    await loadResultPlay();

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

    setShowMenu(null);
    setHoveredIndex(null);
    setTabName("ステータス");
    writeGameUtilRefParams({
      replayUserName: name,
    });

    if (sceneGroup === "End") {
      retry("replay");
    }
  };
  return (
    <div
      className="bg-background text-foreground border-border absolute z-[9999] space-y-2 rounded-md border p-2 text-xl shadow-md md:text-base"
      style={{
        top: "auto",
      }}
    >
      <Button variant="ghost" className="w-full justify-start" asChild>
        <a href={`/user/${userId}`}>ユーザーページへ</a>
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => handleReplayClick()}
        disabled={sceneGroup === "Playing"}
      >
        リプレイ再生
      </Button>
      {session?.user.id ? (
        <MenuClapButton
          resultId={resultId}
          clapOptimisticState={clapOptimisticState}
          toggleClapAction={toggleClapAction}
        />
      ) : null}
    </div>
  );
};

export default RankingMenu;
