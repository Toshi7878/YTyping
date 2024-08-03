"use client";

import { mapAtom, sceneAtom, speedAtom } from "@/app/type/(atoms)/gameRenderAtoms";
import { LineResultData, SendResultData } from "@/app/type/(ts)/type";
import { Button, Stack } from "@chakra-ui/react";
import axios from "axios";
import { useAtom } from "jotai";
import { useParams } from "next/navigation";
import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRefs } from "@/app/type/(contexts)/refsProvider";
import { YTSpeedController } from "@/app/type/(ts)/ytHandleEvents";
import { proceedRetry } from "@/app/type/(ts)/retry";

const RankingMenu = ({
  userId,
  setShowMenu,
  setHoveredIndex,
}: {
  userId: string;
  setShowMenu: React.Dispatch<React.SetStateAction<number | null>>;
  setHoveredIndex: React.Dispatch<React.SetStateAction<number | null>>;
}) => {
  const { gameStateRef, playerRef, statusRef, tabStatusRef, playingComboRef } = useRefs();

  const [scene, setScene] = useAtom(sceneAtom);
  const [, setSpeedData] = useAtom(speedAtom);
  const [map] = useAtom(mapAtom);
  const params = useParams();
  const mapId = params.id as string;

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["replayData", Number(userId), Number(mapId)],
    queryFn: async () => {
      const response = await axios.get<{
        lineResult: LineResultData[];
        status: SendResultData["status"];
      }>(`${process.env.NEXT_PUBLIC_API_URL}/api/replay`, {
        params: {
          mapId: mapId,
          userId: userId,
        },
      });
      return response.data;
    },
    enabled: false,
  });

  const handleReplayClick = useCallback(async () => {
    const result = await refetch();
    if (result.data) {
      if (scene === "end") {
        proceedRetry(
          "replay",
          map!,
          statusRef,
          setScene,
          tabStatusRef,
          playingComboRef,
          gameStateRef,
          playerRef,
        );
      }
      setShowMenu(null);
      setHoveredIndex(null);
      gameStateRef.current!.replay.replayData = result.data.lineResult;
      const defaultSpeed = result.data.status.defaultSpeed;
      new YTSpeedController("setDefaultSpeed", {
        setSpeedData,
        playerRef: playerRef.current,
        speed: defaultSpeed,
        defaultSpeed: defaultSpeed,
      });
      playerRef.current.playVideo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetch]);
  return (
    <Stack className="rounded-md" position="absolute" zIndex="9999" bg="white" boxShadow="md" p={2}>
      <Button
        as="a"
        href={`/user/${userId}`}
        variant="unstyled"
        size="sm"
        _hover={{ backgroundColor: "gray.200" }} // ホバー時の背景色を追加
      >
        ユーザーページへ
      </Button>
      <Button
        variant="unstyled" // ボタンのスタイルを変更
        size="sm"
        _hover={{ backgroundColor: "gray.200" }} // ホバー時の背景色を追加
        onClick={handleReplayClick}
        isDisabled={scene === "playing" || scene === "replay"}
      >
        リプレイ再生
      </Button>
    </Stack>
  );
};

export default RankingMenu;
