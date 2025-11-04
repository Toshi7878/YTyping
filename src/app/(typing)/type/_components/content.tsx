"use client";
import { useQuery } from "@tanstack/react-query";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { BuildMap } from "@/lib/build-map/build-map";
import { useMapQueries } from "@/lib/queries/map.queries";
import { useBreakPoint } from "@/utils/hooks/use-break-point";
import { initializeAllLineResult } from "../_lib/atoms/family";
import { readTotalProgress } from "../_lib/atoms/ref";
import {
  resetTypingStatus,
  setBuiltMap,
  setLineSelectIndex,
  setLineStatus,
  useSceneGroupState,
} from "../_lib/atoms/state";
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
  const sceneGroup = useSceneGroupState();
  const { isSmScreen } = useBreakPoint();
  const [layout, setLayout] = useState<"column" | "row">("row");

  useEffect(() => {
    if (sceneGroup === "Ready") {
      setLayout(isSmScreen ? "column" : "row");
    }
  }, [isSmScreen, sceneGroup]);

  useEffect(() => {
    if (mapData) {
      const builtMap = new BuildMap(mapData);
      setBuiltMap(builtMap);
      initializeAllLineResult(builtMap.initialLineResultData);
      setLineSelectIndex(builtMap.typingLineIndexes?.[0] ?? 0);
      setLineStatus(builtMap.lineLength);
      resetTypingStatus();

      const totalProgress = readTotalProgress();
      if (totalProgress) {
        totalProgress.max = builtMap.duration;
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
          {layout === "row" && <YouTubePlayer isMapLoading={isLoading} videoId={videoId} className="w-[460px]" />}

          <TabsArea className="flex flex-8 flex-col" />
        </section>

        <TypingCard />

        {layout === "column" && (
          <section className="mt-5">
            <YouTubePlayer isMapLoading={isLoading} videoId={videoId} />
          </section>
        )}
      </div>
    </div>
  );
};
