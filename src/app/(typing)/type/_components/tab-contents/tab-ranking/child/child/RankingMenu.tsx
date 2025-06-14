import { useGameUtilityReferenceParams } from "@/app/(typing)/type/atoms/refAtoms";
import { useMapInfoRef, useSceneGroupState, useSetTabIndex } from "@/app/(typing)/type/atoms/stateAtoms";
import { useLoadResultPlay } from "@/app/(typing)/type/hooks/loadResultPlay";
import { useRetry } from "@/app/(typing)/type/hooks/playing-hooks/retry";
import { useSoundEffect } from "@/app/(typing)/type/hooks/playing-hooks/soundEffect";
import { LocalClapState, UploadResult } from "@/types";
import { useCustomToast } from "@/utils/global-hooks/useCustomToast";
import { Button } from "@/components/ui/button";
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
  const setTabIndex = useSetTabIndex();

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
    setTabIndex(0);
    writeGameUtilRefParams({
      replayUserName: name,
    });

    if (sceneGroup === "End") {
      retry("replay");
    }
  };
  return (
    <div
      className="rounded-md absolute z-[9999] bg-background text-foreground shadow-md p-2 border border-border space-y-2 text-xl md:text-base"
      style={{
        top: "auto",
      }}
    >
      <Button 
        variant="ghost" 
        className="w-full justify-start" 
        asChild
      >
        <a href={`/user/${userId}`}>
          ユーザーページへ
        </a>
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
