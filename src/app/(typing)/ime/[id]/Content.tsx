"use client";
import { Button } from "@/components/ui/button";
import { useGlobalLoadingOverlay } from "@/lib/globalAtoms";
import { RouterOutPuts } from "@/server/api/trpc";
import { MapLine } from "@/types/map";
import { useMapQueries } from "@/utils/queries/map.queries";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import InputTextarea from "../_components/InputTextarea";
import MenuBar from "../_components/memu/MenuBar";
import Notifications from "../_components/Notifications";
import ViewArea from "../_components/view-area/ViewArea";
import YouTubePlayer from "../_components/youtube-player";
import { useEnableLargeVideoDisplayState, useReadScene, useSetMap } from "../_lib/atoms/stateAtoms";
import { useParseImeMap } from "../_lib/hooks/parseImeMap";
import { usePathChangeAtomReset } from "../_lib/hooks/reset";
import { useUpdateTypingStats } from "../_lib/hooks/updateTypingStats";

interface ContentProps {
  mapInfo: RouterOutPuts["map"]["getMapInfo"];
}

function Content({ mapInfo }: ContentProps) {
  const { video_id } = mapInfo;
  const lyricsViewAreaRef = useRef<HTMLDivElement>(null);
  const [youtubeHeight, setYoutubeHeight] = useState<{ minHeight: string; height: string }>({
    minHeight: "calc(100vh - var(--header-height))",
    height: "calc(100vh - var(--header-height))",
  });
  const [notificationsHeight, setNotificationsHeight] = useState<string>("calc(100vh - var(--header-height))");
  const { id: mapId } = useParams<{ id: string }>();
  const { data: mapData } = useQuery(useMapQueries().map({ mapId }));
  const setMap = useSetMap();
  const parseImeMap = useParseImeMap();
  const pathChangeAtomReset = usePathChangeAtomReset();
  const readScene = useReadScene();
  const updateTypingStats = useUpdateTypingStats();
  const enableLargeVideoDisplay = useEnableLargeVideoDisplayState();
  const { showLoading, hideLoading } = useGlobalLoadingOverlay();

  const loadMap = async (mapData: MapLine[]) => {
    showLoading({ message: "ひらがな判定生成中..." });

    parseImeMap(mapData)
      .then((map) => {
        setMap(map);
        hideLoading();
      })
      .catch((error) => {
        console.error(error);
        showLoading({
          message: (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              ワード生成に失敗しました。
              <Button onClick={() => loadMap(mapData)}>再試行</Button>
            </div>
          ),
          hideSpinner: true,
        });
      });
  };

  useEffect(() => {
    if (mapData) {
      loadMap(mapData);
    } else {
      showLoading({ message: "譜面読み込み中..." });
    }
  }, [mapData, showLoading]);

  useEffect(() => {
    return () => {
      updateTypingStats();
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

      if (readScene() === "ready") {
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

    return () => {
      resizeObserver.disconnect();
    };
  }, [readScene, enableLargeVideoDisplay]);

  return (
    <>
      <Notifications style={{ height: notificationsHeight }} />
      <YouTubePlayer
        videoId={video_id}
        className={"fixed top-[40px] left-0 w-full"}
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
}

export default Content;
