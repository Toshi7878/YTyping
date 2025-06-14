"use client";
import { RouterOutPuts } from "@/server/api/trpc";
import { ParseMap } from "@/utils/parse-map/parseMap";
import { useMapQueries } from "@/utils/queries/map.queries";
import { useUserAgent } from "@/utils/useUserAgent";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { CSSProperties, useEffect, useState } from "react";
import LoadingOverlayWrapper from "react-loading-overlay-ts";
import TypeTabContent from "../_components/tab-contents/TypeTab";
import MainGameCard from "../_components/typing-area/MainGameCard";
import MobileCover from "../_components/youtube-content/MobileCover";
import TypeYouTubeContent from "../_components/youtube-content/TypeYoutubeContent";
import { useProgress } from "../atoms/refAtoms";
import { usePathChangeAtomReset } from "../atoms/reset";
import {
  useIsLoadingOverlayState,
  useSceneState,
  useSetLineResults,
  useSetLineSelectIndex,
  useSetMap,
  useSetTypingStatus,
  useSetTypingStatusLine,
} from "../atoms/stateAtoms";
import { useDisableKey } from "../hooks/disableKey";
import { useSendUserStats } from "../hooks/playing-hooks/sendUserStats";
import useWindowScale, { CONTENT_WIDTH } from "../hooks/windowScale";

interface ContentProps {
  mapInfo: RouterOutPuts["map"]["getMapInfo"];
}

function Content({ mapInfo }: ContentProps) {
  const { scale } = useWindowScale();
  const { video_id } = mapInfo!;
  const scene = useSceneState();

  const { id: mapId } = useParams() as { id: string };
  const { data: mapData, isLoading } = useQuery(useMapQueries().map({ mapId }));

  const isLoadingOverlay = useIsLoadingOverlayState();
  const disableKeyHandle = useDisableKey();
  const [layoutMode, setLayoutMode] = useState<"column" | "row">("column");

  useEffect(() => {
    const handleResize = () => {
      setLayoutMode(window.innerWidth >= 768 ? "row" : "column");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [ytLayoutMode, setStartedYTLayoutMode] = useState(layoutMode);
  const setMap = useSetMap();
  const setLineResults = useSetLineResults();
  const setLineSelectIndex = useSetLineSelectIndex();
  const setTypingStatusLine = useSetTypingStatusLine();
  const pathChangeAtomReset = usePathChangeAtomReset();
  const { readTotalProgress } = useProgress();
  const { resetTypingStatus } = useSetTypingStatus();
  const { sendTypingStats } = useSendUserStats();
  const { isMobile } = useUserAgent();

  useEffect(() => {
    if (scene === "ready" && layoutMode) {
      setStartedYTLayoutMode(layoutMode as "column" | "row");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutMode]);

  useEffect(() => {
    if (mapData) {
      const map = new ParseMap(mapData);
      setMap(map);
      setLineResults(map.initialLineResultData);
      setLineSelectIndex(map.typingLineIndexes[0]);
      setTypingStatusLine(map.lineLength);
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
      sendTypingStats();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapId]);

  const style: CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: "top center",
    width: `${CONTENT_WIDTH}px`,
    height: "fit-content",
    marginBottom: `${scale < 0.8 ? Math.max(0, (1 - scale) * 400) : 0}px`,
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
      <div style={style}>
        <div className="flex flex-col">
          <div className="flex w-full gap-6">
            {ytLayoutMode === "row" && (
              <div className="relative">
                {isMobile && <MobileCover />}

                <TypeYouTubeContent className="w-[513px]" isMapLoading={isLoading} videoId={video_id} />
              </div>
            )}
            <div className="flex-[8] flex flex-col">
              <TypeTabContent />
            </div>
          </div>
          <div className="mt-5">
            <MainGameCard />
          </div>

          {ytLayoutMode === "column" && (
            <div className="mt-5 relative">
              {isMobile && <MobileCover />}
              <TypeYouTubeContent isMapLoading={isLoading} videoId={video_id} />
            </div>
          )}
        </div>
      </div>
    </LoadingOverlayWrapper>
  );
}

export default Content;
