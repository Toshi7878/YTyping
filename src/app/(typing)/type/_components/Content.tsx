"use client";
import { cn } from "@/lib/utils";
import { RouterOutPuts } from "@/server/api/trpc";
import { ParseMap } from "@/utils/parse-map/parseMap";
import { useMapQueries } from "@/utils/queries/map.queries";
import { useUserAgent } from "@/utils/useUserAgent";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useProgress } from "../_lib/atoms/refAtoms";
import { usePathChangeAtomReset } from "../_lib/atoms/reset";
import {
  useSceneGroupState,
  useSetLineResults,
  useSetLineSelectIndex,
  useSetMap,
  useSetTypingStatus,
  useSetTypingStatusLine,
} from "../_lib/atoms/stateAtoms";
import { useDisableKey } from "../_lib/hooks/disableKey";
import { useSendUserStats } from "../_lib/hooks/playing-hooks/sendUserStats";
import TypeTabContent from "./tab-contents/TypeTab";
import MainGameCard from "./typing-area/MainGameCard";
import MobileCover from "./youtube-content/MobileCover";
import TypeYouTubeContent from "./youtube-content/TypeYoutubeContent";

interface ContentProps {
  mapInfo: RouterOutPuts["map"]["getMapInfo"];
}

function Content({ mapInfo }: ContentProps) {
  const { video_id } = mapInfo!;
  const sceneGroup = useSceneGroupState();

  const { id: mapId } = useParams<{ id: string }>();
  const { data: mapData, isLoading } = useQuery(useMapQueries().map({ mapId }));

  const disableKeyHandle = useDisableKey();
  const setMap = useSetMap();
  const setLineResults = useSetLineResults();
  const setLineSelectIndex = useSetLineSelectIndex();
  const setTypingStatusLine = useSetTypingStatusLine();
  const pathChangeAtomReset = usePathChangeAtomReset();
  const { readTotalProgress } = useProgress();
  const { resetTypingStatus } = useSetTypingStatus();
  const { sendTypingStats } = useSendUserStats();
  const { isMobile } = useUserAgent();

  const [isLayoutLocked, setIsLayoutLocked] = useState(false);

  useEffect(() => {
    if (sceneGroup === "Ready") {
      setIsLayoutLocked(false);
    } else if (sceneGroup === "Playing" || sceneGroup === "End") {
      setIsLayoutLocked(true);
    }
  }, [sceneGroup]);

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

  return (
    <main className="flex flex-col">
      <section className={isLayoutLocked ? "flex w-full flex-col gap-6" : "flex w-full flex-col gap-6 md:flex-row"}>
        <div className={`relative ${isLayoutLocked ? "order-2 hidden" : "order-2 hidden md:order-1 md:block"}`}>
          {isMobile && <MobileCover />}
          <TypeYouTubeContent className="w-full md:w-[513px]" isMapLoading={isLoading} videoId={video_id} />
        </div>
        <TypeTabContent className={cn("flex flex-[8] flex-col", isLayoutLocked ? "order-1" : "order-1 md:order-2")} />
      </section>

      <MainGameCard className="mt-5" />

      <div className={cn("relative mt-5", isLayoutLocked ? "block" : "block md:hidden")}>
        {isMobile && <MobileCover />}
        <TypeYouTubeContent isMapLoading={isLoading} videoId={video_id} />
      </div>
    </main>
  );
}

export default Content;
