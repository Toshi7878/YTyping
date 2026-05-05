"use client";
import { useQuery } from "@tanstack/react-query";
import { buildTypingMap } from "lyrics-typing-engine";
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
  hasAlphabetChunk,
} from "@/lib/build-map/built-map-helper";
import { useTRPC } from "@/trpc/provider";
import { useBreakPoint } from "@/utils/hooks/use-break-point";
import { setBuiltMap } from "./atoms/built-map";
import { initializeAllLineResult, setSelectLineIndex } from "./atoms/line-result";
import { CHAR_POINT } from "./lib/const";
import { useLoadSoundEffects } from "./lib/sound-effect";
import { useTypingOptionsState } from "./tabs/setting/popover";
import { TabsArea } from "./tabs/tabs";
import { resetTypingStatus, setTypingStatus } from "./tabs/typing-status/status-cell";
import { setTotalProgressMax } from "./typing-card/footer/total-time-progress";
import { getReadyInputMode } from "./typing-card/ready/input-mode-radio-cards";
import { TypingCard, useSceneGroupState } from "./typing-card/typing-card";
import { useWindowScale } from "./utils/use-window-scale";
import { YouTubePlayer } from "./youtube/youtube-player";

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
  const { data: rawMapLines, isLoading } = useQuery(
    trpc.map.getJsonById.queryOptions({ mapId }, { staleTime: Infinity, gcTime: Infinity }),
  );

  useEffect(() => {
    if (rawMapLines) {
      const builtMapLines = buildTypingMap({ rawMapLines, charPoint: CHAR_POINT });
      const totalNotes = calculateTotalNotes(builtMapLines);
      const { keyRate, missRate } = calculateKeyAndMissRates({ romaTotalNotes: totalNotes.roma });

      const readyInputMode = getReadyInputMode();
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
        hasAlphabet: hasAlphabetChunk(builtMapLines),
        isCaseSensitive: builtMapLines[0]?.options?.isCaseSensitive ?? false,
      };
      setBuiltMap(builtMap);
      initializeAllLineResult(builtMap.initialLineResults);
      setSelectLineIndex(builtMap.typingLineIndexes?.[0] ?? 0);
      setTypingStatus((prev) => ({ ...prev, line: builtMapLines.length }));
      resetTypingStatus();
      setTotalProgressMax(builtMap.duration);
    }
  }, [rawMapLines]);

  return (
    <div className="fixed flex h-screen w-screen flex-col items-center max-sm:-mt-1.5">
      <TypingLayout isLoading={isLoading} videoId={videoId} />
    </div>
  );
};

const TypingLayout = ({ isLoading, videoId }: { isLoading: boolean; videoId: string }) => {
  const { windowScaleWidth } = useTypingOptionsState();
  const { isSmScreen } = useBreakPoint();
  const [layout, setLayout] = useState<"column" | "row">("row");
  const sceneGroup = useSceneGroupState();
  useEffect(() => {
    if (sceneGroup === "Ready") {
      setLayout(isSmScreen ? "column" : "row");
    }
  }, [isSmScreen, sceneGroup]);
  const { scale, ready } = useWindowScale({ contentWidth: windowScaleWidth });

  const style: CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: "top",
    width: `${windowScaleWidth}px`,
    visibility: ready ? "visible" : "hidden",
  };

  return (
    <div style={style} className="space-y-8 md:space-y-5" id="content_container">
      <section className="flex w-full gap-6 md:flex-row">
        {layout === "row" && <YouTubePlayer className="w-[460px]" isMapLoading={isLoading} videoId={videoId} />}
        <TabsArea className="flex w-full flex-col" />
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
