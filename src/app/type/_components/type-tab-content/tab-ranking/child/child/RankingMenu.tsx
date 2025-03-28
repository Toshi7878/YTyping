import { useGameUtilsRef } from "@/app/type/atoms/refAtoms";
import { useMapInfoRef, useSceneState } from "@/app/type/atoms/stateAtoms";
import { useLoadResultPlay } from "@/app/type/hooks/loadResultPlay";
import { useProceedRetry } from "@/app/type/hooks/playing-hooks/useRetry";
import { useSoundEffect } from "@/app/type/hooks/playing-hooks/useSoundEffect";
import { useCustomToast } from "@/lib/global-hooks/useCustomToast";
import { LocalClapState, ThemeColors, UploadResult } from "@/types";
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
  const scene = useSceneState();
  const toast = useCustomToast();
  const { iosActiveSound } = useSoundEffect();
  const proceedRetry = useProceedRetry();
  const loadResultPlay = useLoadResultPlay({ startMode: "replay", resultId });

  const { writeGameUtils } = useGameUtilsRef();
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
    writeGameUtils({
      replayUserName: name,
    });

    if (scene === "end") {
      proceedRetry("replay");
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
      <Button
        variant="rankingMenu"
        onClick={() => handleReplayClick()}
        isDisabled={scene === "playing" || scene === "replay" || scene === "practice"}
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
    </Stack>
  );
};

export default RankingMenu;
