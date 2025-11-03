"use client";
import { useQuery } from "@tanstack/react-query";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { BuildMap } from "@/lib/build-map/build-map";
import { useMapQueries } from "@/lib/queries/map.queries";
import { useBreakPoint } from "@/utils/hooks/use-break-point";
import { readTotalProgress } from "../_lib/atoms/read-atoms";
import {
  useInitializeLineResults,
  useSceneGroupState,
  useSetLineSelectIndex,
  useSetMap,
  useSetTypingStatus,
  useSetTypingStatusLine,
} from "../_lib/atoms/state-atoms";
import { CONTENT_WIDTH, useWindowScale } from "../_lib/utils/use-window-scale";
import { TabsArea } from "./tabs/tabs";
import { TypingCard } from "./typing-card/typing-card";
import { YouTubePlayer } from "./youtube-player";

interface ContentProps {
  videoId: string;
  mapId: string;
}

export const Content = ({ videoId, mapId }: ContentProps) => {
  const { data: mapData, isLoading } = useQuery(useMapQueries().map({ mapId }));

  const setLineSelectIndex = useSetLineSelectIndex();
  const setTypingStatusLine = useSetTypingStatusLine();
  const initializeLineResults = useInitializeLineResults();

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
      setLineSelectIndex(map.typingLineIndexes?.[0] ?? 0);
      setTypingStatusLine(map.lineLength);
      resetTypingStatus();

      const totalProgress = readTotalProgress();
      if (totalProgress) {
        totalProgress.max = map.duration;
      }
    }
  }, [mapData]);

  const { scale, ready } = useWindowScale();

  const style: CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: "top",
    width: `${CONTENT_WIDTH}px`,
    visibility: ready ? "visible" : "hidden",
  };

  return (
    <div className="fixed flex h-screen w-screen flex-col items-center">
      <div style={style} className="h-fit space-y-8 md:space-y-5">
        <section className="flex w-full gap-6 md:flex-row">
          {ytLayoutMode === "row" && <YouTubePlayer isMapLoading={isLoading} videoId={videoId} className="w-[460px]" />}

          <TabsArea className="flex flex-[8] flex-col" />
        </section>

        <TypingCard />

        {ytLayoutMode === "column" && (
          <section className="mt-5">
            <YouTubePlayer isMapLoading={isLoading} videoId={videoId} />
          </section>
        )}
      </div>
    </div>
  );
};
