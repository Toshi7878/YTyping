"use client";
import { useQuery } from "@tanstack/react-query";
import { buildTypingMap } from "lyrics-typing-engine";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  buildInitialLineResult,
  calculateDuration,
  calculateKeyAndMissRates,
  calculateTotalNotes,
  extractChangeCSSIndexes,
  extractTypingLineIndexes,
} from "@/lib/build-map/generate-initial-result";
import { useTRPC } from "@/trpc/provider";
import { useBreakPoint } from "@/utils/hooks/use-break-point";
import { initializeAllLineResult } from "../_lib/atoms/family";
import { readTotalProgress } from "../_lib/atoms/ref";
import {
  readScene,
  resetTypingStatus,
  setBuiltMap,
  setLineSelectIndex,
  setLineStatus,
  useSceneGroupState,
} from "../_lib/atoms/state";
import { readReadyInputMode } from "../_lib/atoms/storage";
import { CHAR_POINT } from "../_lib/const";
import { mutateTypingStats } from "../_lib/mutate-stats";
import { useLoadSoundEffects } from "../_lib/playing/sound-effect";
import { CONTENT_WIDTH, useWindowScale } from "../_lib/utils/use-window-scale";
import { TabsArea } from "./tabs/tabs";
import { TypingCard } from "./typing-card/typing-card";
import { YouTubePlayer } from "./youtube-player";

interface ContentProps {
  videoId: string;
  mapId: number;
}

export const Content = ({ videoId, mapId }: ContentProps) => {
  useLoadSoundEffects();
  useHotkeys(
    "home, end, pageup, pagedown, capslock, `, f3, f6, space",
    (event) => {
      event.preventDefault();
    },
    { enableOnFormTags: false, preventDefault: true },
  );

  const trpc = useTRPC();
  const { data: mapJson, isLoading } = useQuery(
    trpc.map.getMapJson.queryOptions({ mapId }, { staleTime: Infinity, gcTime: Infinity }),
  );
  const pathname = usePathname();

  useEffect(() => {
    if (mapJson) {
      const builtMapLines = buildTypingMap(mapJson, CHAR_POINT);
      const totalNotes = calculateTotalNotes(builtMapLines);
      const { keyRate, missRate } = calculateKeyAndMissRates({ romaTotalNotes: totalNotes.roma });

      const readyInputMode = readReadyInputMode();
      const typingLineIndexes = extractTypingLineIndexes(builtMapLines);
      const changeCSSIndexes = extractChangeCSSIndexes(builtMapLines);

      const builtMap = {
        lines: builtMapLines,
        totalNotes,
        keyRate,
        missRate,
        initialLineResults: buildInitialLineResult(builtMapLines, readyInputMode),
        typingLineIndexes,
        changeCSSIndexes,
        duration: calculateDuration(builtMapLines),
      };
      setBuiltMap(builtMap);
      initializeAllLineResult(builtMap.initialLineResults);
      setLineSelectIndex(builtMap.typingLineIndexes?.[0] ?? 0);
      setLineStatus(builtMapLines.length);
      resetTypingStatus();

      const totalProgress = readTotalProgress();
      if (totalProgress) {
        totalProgress.max = builtMap.duration;
      }
    }
  }, [mapJson]);

  useEffect(() => {
    return () => {
      const scene = readScene();
      if (scene === "play" || scene === "practice") {
        mutateTypingStats();
      }
    };
  }, [pathname]);

  return (
    <div className="fixed flex h-screen w-screen flex-col items-center">
      <TypingLayout isLoading={isLoading} videoId={videoId} />
    </div>
  );
};

const TypingLayout = ({ isLoading, videoId }: { isLoading: boolean; videoId: string }) => {
  const { isSmScreen } = useBreakPoint();
  const [layout, setLayout] = useState<"column" | "row">("row");
  const sceneGroup = useSceneGroupState();
  useEffect(() => {
    if (sceneGroup === "Ready") {
      setLayout(isSmScreen ? "column" : "row");
    }
  }, [isSmScreen, sceneGroup]);
  const { scale, ready } = useWindowScale();

  const style: CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: "top",
    width: `${CONTENT_WIDTH}px`,
    visibility: ready ? "visible" : "hidden",
  };

  return (
    <div style={style} className="space-y-8 md:space-y-5">
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
  );
};
