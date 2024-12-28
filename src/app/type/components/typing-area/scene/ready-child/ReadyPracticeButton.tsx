import { useDownloadPlayDataJsonQuery } from "@/app/type/hooks/data-query/useDownloadResultJsonQuery";
import { useRefs } from "@/app/type/type-contexts/refsProvider";
import { clientApi } from "@/trpc/client-api";
import { ThemeColors } from "@/types";
import { Button, useTheme } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";

const ReadyPracticeButton = () => {
  const { data: session } = useSession();
  const { id: mapId } = useParams();
  const userId = Number(session?.user.id);

  const [resultId, setResultId] = useState<number | null>(null);
  const utils = clientApi.useUtils();
  const { gameStateRef, playerRef } = useRefs();
  const { data, error, isLoading } = useDownloadPlayDataJsonQuery(resultId);
  const theme: ThemeColors = useTheme();

  const handleClick = useCallback(() => {
    const result = utils.ranking.getMapRanking.getData();
    if (gameStateRef.current!.practice.hasMyRankingData && result) {
      for (let i = 0; i < result.length; i++) {
        if (userId === result[i].userId) {
          setResultId(result[i].id);
          break;
        }
      }
    }

    playerRef.current.playVideo();

    gameStateRef.current!.playMode = "practice";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Button
      variant="outline"
      borderColor={theme.colors.border.card}
      color={theme.colors.text.body}
      px={16}
      py={6}
      size="xl"
      fontSize="3xl"
      _hover={{
        bg: theme.colors.button.sub.hover,
      }}
      onClick={handleClick}
    >
      練習モードで開始
    </Button>
  );
};

export default ReadyPracticeButton;
