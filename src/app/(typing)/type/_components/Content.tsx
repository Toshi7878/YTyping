"use client";
import { useBreakPoint } from "@/lib/useBreakPoint";
import { BuildMap } from "@/utils/build-map/buildMap";
import { useMapQueries } from "@/utils/queries/map.queries";
import { useQuery } from "@tanstack/react-query";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { useProgress } from "../_lib/atoms/refAtoms";
import {
  useInitializeLineResults,
  useSceneGroupState,
  useSetLineSelectIndex,
  useSetMap,
  useSetTypingStatus,
  useSetTypingStatusLine,
} from "../_lib/atoms/stateAtoms";
import useWindowScale, { CONTENT_WIDTH } from "../_lib/hooks/windowScale";
import TabsArea from "./tabs/tabs";
import MainGameCard from "./typing-area/MainGameCard";
import YouTubePlayer from "./youtube-player";

interface ContentProps {
  videoId: string;
  mapId: string;
}

function Content({ videoId, mapId }: ContentProps) {
  const { data: mapData, isLoading } = useQuery(useMapQueries().map({ mapId }));

  const setLineSelectIndex = useSetLineSelectIndex();
  const setTypingStatusLine = useSetTypingStatusLine();
  const initializeLineResults = useInitializeLineResults();

  const { readTotalProgress } = useProgress();
  const { resetTypingStatus } = useSetTypingStatus();

  const setMap = useSetMap();
  const sceneGroup = useSceneGroupState();
  const { isSmScreen } = useBreakPoint();

  const [ytLayoutMode, setYtLayoutMode] = useState<"column" | "row">("row");
  useEffect(() => {
    if (sceneGroup === "Ready") {
      setYtLayoutMode(isSmScreen ? "column" : "row");
    }
  }, [isSmScreen]);

  useEffect(() => {
    if (mapData) {
      const map = new BuildMap(mapData);
      setMap(map);
      initializeLineResults(map.initialLineResultData);
      setLineSelectIndex(map.typingLineIndexes[0]);
      setTypingStatusLine(map.lineLength);
      resetTypingStatus();

      const totalProgress = readTotalProgress();
      totalProgress.max = map.duration;
    }
  }, [mapData]);

  const { scale } = useWindowScale();

  const style: CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: "top",
    width: `${CONTENT_WIDTH}px`,
  };

  return (
    <div className="fixed flex h-screen w-screen flex-col items-center">
      <div style={style} className="h-fit">
        <section className="flex w-full gap-6 md:flex-row">
          {ytLayoutMode === "row" && <YouTubePlayer isMapLoading={isLoading} videoId={videoId} className="w-[460px]" />}

          <TabsArea className="flex flex-[8] flex-col" />
        </section>

        <MainGameCard className="mt-5" />

        {ytLayoutMode === "column" && (
          <section className="mt-5">
            <YouTubePlayer isMapLoading={isLoading} videoId={videoId} />
          </section>
        )}
      </div>
    </div>
  );
}

export default Content;
