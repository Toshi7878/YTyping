"use client";
import { IS_ANDROID, IS_IOS, QUERY_KEYS } from "@/config/global-consts";
import { RouterOutPuts } from "@/server/api/trpc";
import { clientApi } from "@/trpc/client-api";
import { Box, Flex, useBreakpointValue } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { RESET } from "jotai/utils";
import { useParams } from "next/navigation";
import { CSSProperties, useEffect, useState } from "react";
import LoadingOverlayWrapper from "react-loading-overlay-ts";
import TypeTabContent from "../_components/type-tab-content/TypeTab";
import MobileCover from "../_components/type-youtube-content/MobileCover";
import TypeYouTubeContent from "../_components/type-youtube-content/TypeYoutubeContent";
import TypingCard from "../_components/typing-area/TypingCard";
import { useDownloadMapDataJsonQuery } from "../hooks/data-query/useDownloadMapDataJsonQuery";
import { useDisableKeyHandle } from "../hooks/useDisableKeyHandle";
import useWindowScale, { CONTENT_HEIGHT, CONTENT_WIDTH } from "../hooks/useWindowScale";
import { InputModeType } from "../ts/type";
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

interface ContentProps {
  mapInfo: RouterOutPuts["map"]["getMapInfo"];
}

function Content({ mapInfo }: ContentProps) {
  const { scale } = useWindowScale();
  const { videoId, title, creatorComment, tags } = mapInfo!;
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
  const { isLoading } = useDownloadMapDataJsonQuery();
  const isLoadingOverlay = useIsLoadingOverlayAtom();
  const queryClient = useQueryClient();
  const disableKeyHandle = useDisableKeyHandle();
  const { resetStatusValues } = useSetStatusAtoms();
  const setCombo = useSetComboAtom();
  const setChangeCSSCount = useSetChangeCSSCountAtom();
  const setPlayingInputMode = useSetPlayingInputModeAtom();
  const utils = clientApi.useUtils();
  const layoutMode = useBreakpointValue({ base: "column", md: "row" });
  const [ytLayoutMode, setStartedYTLayoutMode] = useState(layoutMode);

  useEffect(() => {
    if (scene === "ready" && layoutMode) {
      setStartedYTLayoutMode(layoutMode as "column" | "row");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutMode]);

  useEffect(() => {
    window.addEventListener("keydown", disableKeyHandle);

    return () => {
      window.removeEventListener("keydown", disableKeyHandle);
      // コンポーネントのアンマウント時にクエリキャッシュをクリア
      queryClient.removeQueries({ queryKey: QUERY_KEYS.mapData(mapId) });
      utils.ranking.getMapRanking.invalidate();
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
    height: `${CONTENT_HEIGHT}px`,
  };

  return (
    <LoadingOverlayWrapper active={isLoadingOverlay} spinner={true} text="Loading...">
      <Flex
        as="main"
        id="main_content"
        flexDirection="column"
        alignItems="center"
        pt={{ base: 12, md: 16 }}
        width="100%"
        height="100vh"
        overflowX="hidden"
        overflowY={layoutMode === "row" ? "hidden" : "auto"}
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
                    videoId={videoId}
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
                <TypeYouTubeContent isMapLoading={isLoading} videoId={videoId} />
              </Box>
            )}
          </Flex>
        </Box>
      </Flex>
    </LoadingOverlayWrapper>
  );
}

export default Content;
