"use client";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGlobalLoadingOverlay } from "@/lib/atoms/global-atoms";
import type { RouterOutPuts } from "@/server/api/trpc";
import { useTRPC } from "@/trpc/provider";
import type { MapLine } from "@/validator/map-json";
import { InputTextarea } from "../_components/input-textarea";
import { MenuBar } from "../_components/memu/menu-bar";
import { Notifications } from "../_components/notifications-display";
import { ViewArea } from "../_components/view-area/view-area";
import { YouTubePlayer } from "../_components/youtube-player";
import { readMapId } from "../_lib/atoms/hydrate";
import { readScene, setBuiltMap, useEnableLargeVideoDisplayState } from "../_lib/atoms/state";
import { buildImeMap } from "../_lib/core/bulid-ime-map";
import { mutateImeStats } from "../_lib/core/mutate-stats";
import { pathChangeAtomReset } from "../_lib/core/reset";

interface ContentProps {
  mapInfo: RouterOutPuts["map"]["getMapInfo"];
}

export const Content = ({ mapInfo }: ContentProps) => {
  const { videoId } = mapInfo;
  const lyricsViewAreaRef = useRef<HTMLDivElement>(null);
  const [youtubeHeight, setYoutubeHeight] = useState<{ minHeight: string; height: string }>({
    minHeight: "calc(100vh - var(--header-height))",
    height: "calc(100vh - var(--header-height))",
  });
  const [notificationsHeight, setNotificationsHeight] = useState("calc(100vh - var(--header-height))");
  const trpc = useTRPC();
  const mapId = readMapId();
  const { data: mapData } = useQuery(
    trpc.map.getMapJson.queryOptions(
      { mapId: Number(mapId) ?? 0 },
      { enabled: !!mapId, staleTime: Infinity, gcTime: Infinity },
    ),
  );
  const enableLargeVideoDisplay = useEnableLargeVideoDisplayState();
  const { showLoading, hideLoading } = useGlobalLoadingOverlay();

  const loadMap = async (mapData: MapLine[]) => {
    showLoading({ message: "ひらがな判定生成中..." });

    try {
      const map = await buildImeMap(mapData);
      setBuiltMap(map);
      hideLoading();
    } catch {
      showLoading({
        message: (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            ワード生成に失敗しました。
            <Button onClick={() => loadMap(mapData)}>再試行</Button>
          </div>
        ),
        hideSpinner: true,
      });
    }
  };

  useEffect(() => {
    if (mapData) {
      void loadMap(mapData);
    } else {
      showLoading({ message: "譜面読み込み中..." });
    }
  }, [mapData, showLoading, loadMap]);

  useEffect(() => {
    return () => {
      void mutateImeStats();
      pathChangeAtomReset();
      hideLoading();
    };
  }, [mapId]);

  useEffect(() => {
    const lyricsViewAreaElement = lyricsViewAreaRef.current;
    if (!lyricsViewAreaElement) return;

    const updateHeights = () => {
      const lyricsViewAreaHeight = lyricsViewAreaElement.offsetHeight || 0;
      const computedStyle = window.getComputedStyle(lyricsViewAreaElement);
      const bottomValue = computedStyle.bottom;
      const bottomPx = bottomValue === "auto" ? 0 : parseInt(bottomValue, 10) || 0;

      // 画面幅がmd（768px）以下の場合はlyricsViewAreaHeightを引かない
      const isMdOrBelow = window.innerWidth <= 1280;
      const textareaHeight = lyricsViewAreaElement.querySelector("textarea")?.offsetHeight || 0;
      const menuBarHeight = document.getElementById("menu_bar")?.offsetHeight || 0;
      const viewheight = isMdOrBelow || enableLargeVideoDisplay ? textareaHeight + menuBarHeight : lyricsViewAreaHeight;

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
  }, [enableLargeVideoDisplay]);

  return (
    <>
      <Notifications style={{ height: notificationsHeight }} />
      <YouTubePlayer
        videoId={videoId}
        className="fixed top-[40px] left-0 w-full"
        style={{ height: youtubeHeight.height, minHeight: youtubeHeight.minHeight }}
      />

      <div
        ref={lyricsViewAreaRef}
        className="fixed bottom-0 left-0 flex w-full flex-col lg:bottom-[100px] xl:bottom-[150px]"
      >
        <ViewArea />
        <InputTextarea />
        <MenuBar />
      </div>
    </>
  );
};
