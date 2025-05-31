import { useGameUtilityReferenceParams } from "@/app/(typing)/type/atoms/refAtoms";
import { useMapInfoRef, useSceneGroupState, useSetTabIndex } from "@/app/(typing)/type/atoms/stateAtoms";
import { useLoadResultPlay } from "@/app/(typing)/type/hooks/loadResultPlay";
import { useRetry } from "@/app/(typing)/type/hooks/playing-hooks/retry";
import { useSoundEffect } from "@/app/(typing)/type/hooks/playing-hooks/soundEffect";
import { LocalClapState, ThemeColors, UploadResult } from "@/types";
import { useCustomToast } from "@/util/global-hooks/useCustomToast";
import { Button, Stack, useTheme } from "@chakra-ui/react";
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
  const theme: ThemeColors = useTheme();
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
    <Stack
      className="rounded-md"
      position="absolute"
      zIndex="9999"
      bg={theme.colors.background.body}
      color={theme.colors.text.body}
      boxShadow="md"
      p={2}
      border="0.5px"
      borderColor={theme.colors.border.card}
      top={{ base: "auto", md: "auto" }}
      fontSize={{ base: "3xl", md: "xl" }}
    >
      <Button variant="rankingMenu" as="a" display="flex" href={`/user/${userId}`}>
        ユーザーページへ
      </Button>
      <Button variant="rankingMenu" onClick={() => handleReplayClick()} isDisabled={sceneGroup === "Playing"}>
        リプレイ再生
      </Button>
      {session?.user.id ? (
        <MenuClapButton
          resultId={resultId}
          clapOptimisticState={clapOptimisticState}
          toggleClapAction={toggleClapAction}
        />
      ) : null}
    </Stack>
  );
};

export default RankingMenu;
