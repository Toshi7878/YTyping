"use client";
import { IS_ANDROID, IS_IOS } from "@/config/consts/globalConst";
import { useMapQuery } from "@/lib/global-hooks/query/mapRouterQuery";
import { CreateMap } from "@/lib/instanceMapData";
import { RouterOutPuts } from "@/server/api/trpc";
import { Box, Flex, useBreakpointValue } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import { CSSProperties, useEffect, useState } from "react";
import LoadingOverlayWrapper from "react-loading-overlay-ts";
import TypeTabContent from "../_components/type-tab-content/TypeTab";
import MobileCover from "../_components/type-youtube-content/MobileCover";
import TypeYouTubeContent from "../_components/type-youtube-content/TypeYoutubeContent";
import MainGameCard from "../_components/typing-area/MainGameCard";
import { useProgress } from "../atoms/refAtoms";
import { usePathChangeAtomReset } from "../atoms/reset";
import {
  useIsLoadingOverlayState,
  useSceneState,
  useSetLineResultsState,
  useSetLineSelectIndexState,
  useSetMapState,
  useSetTypingStatusState,
} from "../atoms/stateAtoms";
import { useDisableKeyHandle } from "../hooks/useDisableKeyHandle";
import useWindowScale, { CONTENT_WIDTH } from "../hooks/useWindowScale";

interface ContentProps {
  mapInfo: RouterOutPuts["map"]["getMapInfo"];
}

function Content({ mapInfo }: ContentProps) {
  const { scale } = useWindowScale();
  const { video_id } = mapInfo!;
  const scene = useSceneState();

  const { id: mapId } = useParams();
  const { data: mapData, isLoading } = useMapQuery({ mapId: mapId as string | undefined });

  const isLoadingOverlay = useIsLoadingOverlayState();
  const disableKeyHandle = useDisableKeyHandle();
  const layoutMode = useBreakpointValue({ base: "column", md: "row" });
  const [ytLayoutMode, setStartedYTLayoutMode] = useState(layoutMode);
  const setMap = useSetMapState();
  const setLineResults = useSetLineResultsState();
  const setLineSelectIndex = useSetLineSelectIndexState();
  const pathChangeAtomReset = usePathChangeAtomReset();
  const { readTotalProgress } = useProgress();
  const { resetTypingStatus } = useSetTypingStatusState();

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
      setLineSelectIndex(map.typingLineNumbers[0]);
      resetTypingStatus();

      const totalProgress = readTotalProgress();
      totalProgress.max = map.movieTotalTime;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapData]);

  useEffect(() => {
    window.addEventListener("keydown", disableKeyHandle);

    return () => {
      window.removeEventListener("keydown", disableKeyHandle);
      pathChangeAtomReset();
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
          zIndex: 9999,
        }),
      }}
    >
      <Box style={style}>
        <Flex direction="column">
          <Flex width="100%" gap="6">
            {ytLayoutMode === "row" && (
              <Box position="relative">
                {(IS_IOS || IS_ANDROID) && <MobileCover />}

                <TypeYouTubeContent className="w-[513px] " isMapLoading={isLoading} videoId={video_id} />
              </Box>
            )}
            <Box flex={{ base: "8" }} flexDirection="column">
              <TypeTabContent />
            </Box>
          </Flex>
          <Box mt={5}>
            <MainGameCard />
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
