"use client";
import { IS_ANDROID, IS_IOS } from "@/config/consts/globalConst";
import { CreateMap } from "@/lib/instanceMapData";
import { RouterOutPuts } from "@/server/api/trpc";
import { clientApi } from "@/trpc/client-api";
import { Box, Flex, useBreakpointValue } from "@chakra-ui/react";
import { RESET } from "jotai/utils";
import { useParams } from "next/navigation";
import { CSSProperties, useEffect, useState } from "react";
import LoadingOverlayWrapper from "react-loading-overlay-ts";
import TypeTabContent from "../_components/type-tab-content/TypeTab";
import MobileCover from "../_components/type-youtube-content/MobileCover";
import TypeYouTubeContent from "../_components/type-youtube-content/TypeYoutubeContent";
import TypingCard from "../_components/typing-area/TypingCard";
import { useDisableKeyHandle } from "../hooks/useDisableKeyHandle";
import useWindowScale, { CONTENT_WIDTH } from "../hooks/useWindowScale";
import { InputModeType, MapData } from "../ts/type";
import {
  useIsLoadingOverlayAtom,
  useSceneAtom,
  useSetChangeCSSCountAtom,
  useSetComboAtom,
  useSetLineResultsAtom,
  useSetLineSelectIndexAtom,
  useSetMapAtom,
  useSetPlayingInputModeAtom,
  useSetPlayingNotifyAtom,
  useSetRankingScoresAtom,
  useSetSceneAtom,
  useSetStatusAtoms,
  useSetTimeOffsetAtom,
  useSetTypePageSpeedAtom,
} from "../type-atoms/gameRenderAtoms";
import { useRefs } from "../type-contexts/refsProvider";

interface ContentProps {
  mapInfo: RouterOutPuts["map"]["getMapInfo"];
}

function Content({ mapInfo }: ContentProps) {
  const { scale } = useWindowScale();
  const { video_id, title, creator_comment, tags } = mapInfo!;
  const scene = useSceneAtom();

  const { id: mapId } = useParams();
  const setMap = useSetMapAtom();
  const setScene = useSetSceneAtom();
  const setRankingScores = useSetRankingScoresAtom();
  const setSpeedData = useSetTypePageSpeedAtom();
  const setNotify = useSetPlayingNotifyAtom();
  const setLineResults = useSetLineResultsAtom();
  const setLineSelectIndex = useSetLineSelectIndexAtom();
  const setTimeOffset = useSetTimeOffsetAtom();
  const { data: mapData, isLoading } = clientApi.map.getMap.useQuery<MapData[]>(
    {
      mapId: mapId as string,
    },
    {
      gcTime: 0,
    }
  );
  const isLoadingOverlay = useIsLoadingOverlayAtom();
  const disableKeyHandle = useDisableKeyHandle();
  const { resetStatusValues } = useSetStatusAtoms();
  const setCombo = useSetComboAtom();
  const setChangeCSSCount = useSetChangeCSSCountAtom();
  const setPlayingInputMode = useSetPlayingInputModeAtom();
  const utils = clientApi.useUtils();
  const layoutMode = useBreakpointValue({ base: "column", md: "row" });
  const [ytLayoutMode, setStartedYTLayoutMode] = useState(layoutMode);
  const { setStatusValues } = useSetStatusAtoms();
  const { totalProgressRef } = useRefs();

  useEffect(() => {
    if (scene === "ready" && layoutMode) {
      setStartedYTLayoutMode(layoutMode as "column" | "row");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutMode]);

  useEffect(() => {
    if (mapData) {
      const map = new CreateMap(mapData);
      setMap(map);
      setLineResults(map.defaultLineResultData);
      setStatusValues({ line: map.lineLength });
      setLineSelectIndex(map.typingLineNumbers[0]);
      totalProgressRef.current!.max = map.movieTotalTime;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapData]);

  useEffect(() => {
    window.addEventListener("keydown", disableKeyHandle);

    return () => {
      window.removeEventListener("keydown", disableKeyHandle);
      utils.ranking.getMapRanking.invalidate({ mapId: Number(mapId) });
      setMap(null);
      setScene(RESET);
      setNotify(RESET);
      setLineResults([]);
      setLineSelectIndex(0);
      setTimeOffset(0);
      setRankingScores([]);
      setSpeedData({
        defaultSpeed: 1,
        playSpeed: 1,
      });
      resetStatusValues();
      setCombo(0);
      setChangeCSSCount(0);
      setPlayingInputMode((localStorage.getItem("inputMode") as InputModeType) || "roma");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapId]);

  const style: CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: "top",
    width: `${CONTENT_WIDTH}px`,
    height: "fit-content",
  };

  return (
    <LoadingOverlayWrapper
      active={isLoadingOverlay}
      spinner={true}
      text="Loading..."
      styles={{
        overlay: (base: React.CSSProperties) => ({
          ...base,
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 9999, // 必要に応じて調整
        }),
      }}
    >
      <Box style={style}>
        <Flex direction="column">
          <Flex width="100%" gap="6">
            {ytLayoutMode === "row" && (
              <Box position="relative">
                {(IS_IOS || IS_ANDROID) && <MobileCover />}

                <TypeYouTubeContent
                  className="w-[513px]"
                  isMapLoading={isLoading}
                  videoId={video_id}
                />
              </Box>
            )}
            <Box flex={{ base: "8" }} flexDirection="column">
              <TypeTabContent />
            </Box>
          </Flex>
          <Box mt={5}>
            <TypingCard />
          </Box>

          {ytLayoutMode === "column" && (
            <Box mt={5} position="relative">
              {(IS_IOS || IS_ANDROID) && <MobileCover />}
              <TypeYouTubeContent isMapLoading={isLoading} videoId={video_id} />
            </Box>
          )}
        </Flex>
      </Box>
    </LoadingOverlayWrapper>
  );
}

export default Content;
