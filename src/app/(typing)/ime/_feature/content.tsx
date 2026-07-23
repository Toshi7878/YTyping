"use client";
import { useQuery } from "@tanstack/react-query";
import {
  buildImeLines,
  buildImeWords,
  createFlatWords,
  createInitWordResults,
  getTotalNotes,
} from "lyrics-ime-typing-engine";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { RouterOutputs } from "@/server/api/trpc";
import { useTRPC } from "@/trpc/provider";
import { Button } from "@/ui/button";
import { overlay } from "@/ui/overlay";
import type { RawMapLine } from "@/validator/map/raw-map-json";
import { readImeStats } from "../_lib/atoms/ref";
import { readScene, setBuiltMap } from "../_lib/atoms/state";
import { ensureLyricsWithReadings } from "../_lib/core/ensure-lyrics-with-readings";
import { mutateImeStats } from "../_lib/core/mutate-stats";
import { pathChangeAtomReset } from "../_lib/core/reset";
import "./user-script";
import { InputTextarea } from "./input-textarea";
import { MenuBar } from "./memu/menu-bar";
import { addNotifications, Notifications } from "./notifications";
import { getImeOptions } from "./provider";
import { ViewArea } from "./view-area/view-area";
import { YouTubePlayer } from "./youtube-player";

interface ContentProps {
  mapInfo: RouterOutputs["map"]["getById"];
  mapId: number;
}

export const Content = ({ mapInfo, mapId }: ContentProps) => {
  const {
    media: { videoId },
  } = mapInfo;
  const trpc = useTRPC();
  const pathname = usePathname();
  const { data: mapJson } = useQuery(
    trpc.map.getJsonById.queryOptions({ mapId }, { enabled: !!mapId, staleTime: Infinity, gcTime: Infinity }),
  );
  const loadMap = async (mapData: RawMapLine[]) => {
    overlay.loading("ひらがな判定生成中...");

    try {
      const { isCaseSensitive, includeRegexPattern, enableIncludeRegex, insertEnglishSpaces } = getImeOptions();
      const lines = await buildImeLines(mapData, { isCaseSensitive, includeRegexPattern, enableIncludeRegex });

      const words = await buildImeWords(lines, ensureLyricsWithReadings, { insertEnglishSpaces });
      const totalNotes = getTotalNotes(words);
      const flatWords = createFlatWords(words);
      const initWordResults = createInitWordResults(flatWords);
      setBuiltMap({ lines, words, totalNotes, initWordResults, flatWords });
      overlay.hide();

      const ruleNotifications: string[] = [];
      if (insertEnglishSpaces) ruleNotifications.push("英語スペースあり");
      if (isCaseSensitive) ruleNotifications.push("英語大文字あり");
      if (enableIncludeRegex && includeRegexPattern) ruleNotifications.push(`有効文字: ${includeRegexPattern}`);
      if (ruleNotifications.length > 0) addNotifications([`ルール: ${ruleNotifications.join(" / ")}`]);
    } catch {
      overlay.message(
        <div className="flex h-full flex-col items-center justify-center gap-2">
          ワード生成に失敗しました。
          <Button onClick={() => loadMap(mapData)}>再試行</Button>
        </div>,
      );
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: mapJsonが変更されたら再読み込みする
  useEffect(() => {
    if (mapJson) {
      void loadMap(mapJson);
    } else {
      overlay.loading("譜面読み込み中...");
    }
  }, [mapJson]);

  // biome-ignore lint/correctness/useExhaustiveDependencies:  pathname変更時のみ発火させたいため
  useEffect(() => {
    return () => {
      const stats = readImeStats();
      mutateImeStats(stats);
      pathChangeAtomReset();
      overlay.hide();
    };
  }, [pathname]);

  return <TypingLayout videoId={videoId} />;
};

const TypingLayout = ({ videoId }: { videoId: string }) => {
  const lyricsViewAreaRef = useRef<HTMLDivElement>(null);
  const [youtubeHeight, setYoutubeHeight] = useState<{ minHeight: string; height: string }>({
    minHeight: "calc(100vh - var(--header-height))",
    height: "calc(100vh - var(--header-height))",
  });
  const [notificationsHeight, setNotificationsHeight] = useState("calc(100vh - var(--header-height))");

  useEffect(() => {
    const lyricsViewAreaElement = lyricsViewAreaRef.current;
    if (!lyricsViewAreaElement) return;

    const updateHeights = () => {
      const lyricsViewAreaHeight = lyricsViewAreaElement.offsetHeight || 0;
      const computedStyle = window.getComputedStyle(lyricsViewAreaElement);
      const bottomValue = computedStyle.bottom;
      const bottomPx = bottomValue === "auto" ? 0 : parseInt(bottomValue, 10) || 0;

      const viewAreaHeight = lyricsViewAreaElement.firstElementChild?.getBoundingClientRect().height || 0;
      const viewheight = lyricsViewAreaHeight - viewAreaHeight;

      const scene = readScene();

      if (scene === "ready") {
        setYoutubeHeight({
          minHeight: `calc(100vh - 40px - ${viewheight}px - ${bottomPx}px)`,
          height: `calc(100vh - 40px - ${viewheight}px - ${bottomPx}px)`,
        });
      } else {
        setYoutubeHeight((prev) => ({
          ...prev,
          height: `calc(100vh - 40px - ${viewheight}px - ${bottomPx}px)`,
        }));
      }

      setNotificationsHeight(`calc(100vh - 40px - ${lyricsViewAreaHeight}px - ${bottomPx}px - 20px)`);
    };

    updateHeights();

    const resizeObserver = new ResizeObserver(() => {
      updateHeights();
    });

    resizeObserver.observe(lyricsViewAreaElement);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <>
      <Notifications style={{ height: notificationsHeight }} />
      <YouTubePlayer
        videoId={videoId}
        className="fixed top-10 left-0 w-full"
        style={{ height: youtubeHeight.height, minHeight: youtubeHeight.minHeight }}
      />

      <div ref={lyricsViewAreaRef} className="fixed bottom-0 left-0 flex w-full flex-col">
        <ViewArea />
        <InputTextarea />
        <MenuBar />
        <div id="bottom_spacer" className="lg:h-25 xl:h-37.5" />
      </div>
    </>
  );
};
