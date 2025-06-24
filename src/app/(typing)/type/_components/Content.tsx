"use client";
import { RouterOutPuts } from "@/server/api/trpc";
import { ParseMap } from "@/utils/parse-map/parseMap";
import { useMapQueries } from "@/utils/queries/map.queries";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useProgress } from "../_lib/atoms/refAtoms";
import {
  useSetLineResults,
  useSetLineSelectIndex,
  useSetMap,
  useSetTypingStatus,
  useSetTypingStatusLine,
} from "../_lib/atoms/stateAtoms";
import TabsArea from "./tab-contents/TabsArea";
import MainGameCard from "./typing-area/MainGameCard";
import YouTubeContent from "./youtube-content/TypeYoutubeContent";

interface ContentProps {
  video_id: RouterOutPuts["map"]["getMapInfo"]["video_id"];
  mapId: string;
}

function Content({ video_id, mapId }: ContentProps) {
  const { data: mapData, isLoading } = useQuery(useMapQueries().map({ mapId }));

  const setMap = useSetMap();
  const setLineResults = useSetLineResults();
  const setLineSelectIndex = useSetLineSelectIndex();
  const setTypingStatusLine = useSetTypingStatusLine();

  const { readTotalProgress } = useProgress();
  const { resetTypingStatus } = useSetTypingStatus();

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

  return (
    <main className="flex w-full flex-col">
      <section className="flex w-full flex-col gap-6 md:flex-row">
        <div className={`relative order-2 hidden md:order-1 md:block`}>
          <YouTubeContent className="w-full md:w-[513px]" isMapLoading={isLoading} videoId={video_id} />
        </div>
        <TabsArea className="order-1 flex flex-[8] flex-col md:order-2" />
      </section>

      <MainGameCard className="mt-5" />

      <div className="relative mt-5 block md:hidden">
        <YouTubeContent isMapLoading={isLoading} videoId={video_id} />
      </div>
    </main>
  );
}

export default Content;
