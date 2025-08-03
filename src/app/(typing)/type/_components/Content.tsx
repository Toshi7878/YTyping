"use client";
import { RouterOutPuts } from "@/server/api/trpc";
import { ParseMap } from "@/utils/parse-map/parseMap";
import { useMapQueries } from "@/utils/queries/map.queries";
import { useQuery } from "@tanstack/react-query";
import { CSSProperties, useEffect, useState } from "react";
import useBreakpoint from "use-breakpoint";
import { useProgress } from "../_lib/atoms/refAtoms";
import {
  useSceneGroupState,
  useSetLineResults,
  useSetLineSelectIndex,
  useSetMap,
  useSetTypingStatus,
  useSetTypingStatusLine,
} from "../_lib/atoms/stateAtoms";
import useWindowScale, { CONTENT_WIDTH } from "../_lib/hooks/windowScale";
import TabsArea from "./tab-contents/TabsArea";
import MainGameCard from "./typing-area/MainGameCard";
import YouTubeContent from "./youtube-content/TypeYoutubeContent";

// TailwindのデフォルトブレークポイントにmatchするBreakpoint設定
const BREAKPOINTS = { mobile: 0, tablet: 768, desktop: 1024 };

interface ContentProps {
  video_id: RouterOutPuts["map"]["getMapInfo"]["video_id"];
  mapId: string;
}

function Content({ video_id, mapId }: ContentProps) {
  const { data: mapData, isLoading } = useQuery(useMapQueries().map({ mapId }));

  const setLineResults = useSetLineResults();
  const setLineSelectIndex = useSetLineSelectIndex();
  const setTypingStatusLine = useSetTypingStatusLine();

  const { readTotalProgress } = useProgress();
  const { resetTypingStatus } = useSetTypingStatus();

  const setMap = useSetMap();
  const sceneGroup = useSceneGroupState();
  const { breakpoint } = useBreakpoint(BREAKPOINTS, "mobile");

  const [ytLayoutMode, setYtLayoutMode] = useState<"column" | "row">("column");
  useEffect(() => {
    if (sceneGroup === "Ready") {
      setYtLayoutMode(breakpoint === "mobile" ? "column" : "row");
    }
  }, [breakpoint]);

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
          {ytLayoutMode === "row" && (
            <YouTubeContent isMapLoading={isLoading} videoId={video_id} className="w-full md:w-[460px]" />
          )}

          <TabsArea className="flex flex-[8] flex-col" />
        </section>

        <MainGameCard className="mt-5" />

        {ytLayoutMode === "column" && (
          <section className="mt-5">
            <YouTubeContent isMapLoading={isLoading} videoId={video_id} />
          </section>
        )}
      </div>
    </div>
  );
}

export default Content;
