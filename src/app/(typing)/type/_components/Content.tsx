"use client";
import { RouterOutPuts } from "@/server/api/trpc";
import { ParseMap } from "@/utils/parse-map/parseMap";
import { useMapQueries } from "@/utils/queries/map.queries";
import { useQuery } from "@tanstack/react-query";
import { CSSProperties, useEffect } from "react";
import useBreakpoint from "use-breakpoint";
import { useProgress } from "../_lib/atoms/refAtoms";
import {
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

  // ブレークポイントの状態を取得
  const { breakpoint } = useBreakpoint(BREAKPOINTS, "mobile");
  const isMobileOrTablet = breakpoint === "mobile" || breakpoint === "tablet";

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

  const { scale } = useWindowScale();

  const style: CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: "top",
    width: `${CONTENT_WIDTH}px`,
  };

  return (
    <div className="fixed flex h-screen w-screen flex-col items-center">
      <div style={style} className="h-fit">
        <section className="flex w-full flex-col gap-6 md:flex-row">
          <div className={`relative order-2 md:order-1`}>
            {!isMobileOrTablet && (
              <YouTubeContent isMapLoading={isLoading} videoId={video_id} className="w-full md:w-[460px]" />
            )}
          </div>
          <TabsArea className="order-1 flex flex-[8] flex-col md:order-2" />
        </section>

        <MainGameCard className="mt-5" />

        {isMobileOrTablet && (
          <section className="relative mt-5">
            <YouTubeContent isMapLoading={isLoading} videoId={video_id} />
          </section>
        )}
      </div>
    </div>
  );
}

export default Content;
