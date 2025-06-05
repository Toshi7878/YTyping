"use client";
import { RouterOutPuts } from "@/server/api/trpc";
import { MapLine } from "@/types/map";
import { useMapQueries } from "@/util/global-hooks/queries/map.queries";
import { Box, Button, Flex } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import LoadingOverlayWrapper from "react-loading-overlay-ts";
import ImeTypeYouTubeContent from "../_components/ImeTypeYoutubeContent";
import InputTextarea from "../_components/InputTextarea";
import MenuBar from "../_components/memu/MenuBar";
import Notifications from "../_components/Notifications";
import ViewArea from "../_components/view-area/ViewArea";
import { useEnableLargeVideoDisplayState, useMapState, useReadScene, useSetMap } from "../atom/stateAtoms";
import { useParseImeMap } from "../hooks/parseImeMap";
import { usePathChangeAtomReset } from "../hooks/reset";
import { useUpdateTypingStats } from "../hooks/updateTypingStats";

interface ContentProps {
  mapInfo: RouterOutPuts["map"]["getMapInfo"];
}

function Content({ mapInfo }: ContentProps) {
  const { video_id } = mapInfo!;
  const lyricsViewAreaRef = useRef<HTMLDivElement>(null);
  const [youtubeHeight, setYoutubeHeight] = useState<{ minHeight: string; height: string }>({
    minHeight: "calc(100vh - var(--header-height))",
    height: "calc(100vh - var(--header-height))",
  });
  const [notificationsHeight, setNotificationsHeight] = useState<string>("calc(100vh - var(--header-height))");
  const { id: mapId } = useParams() as { id: string };
  const { data: mapData } = useQuery(useMapQueries().map({ mapId }));
  const setMap = useSetMap();
  const parseImeMap = useParseImeMap();
  const map = useMapState();
  const pathChangeAtomReset = usePathChangeAtomReset();
  const readScene = useReadScene();
  const [tokenizerError, setTokenizerError] = useState<boolean>(false);
  const updateTypingStats = useUpdateTypingStats();
  const enableLargeVideoDisplay = useEnableLargeVideoDisplayState();

  const loadMap = (mapData: MapLine[]) => {
    parseImeMap(mapData)
      .then((map) => {
        setMap(map);
      })
      .catch((error) => {
        console.error(error);
        setTokenizerError(true);
      });
  };

  useEffect(() => {
    if (mapData) {
      loadMap(mapData);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapData]);

  useEffect(() => {
    return () => {
      updateTypingStats();
      pathChangeAtomReset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const loadingMessage = tokenizerError ? (
    <Flex flexDirection="column" alignItems="center" justifyContent="center" height="100%" gap={2}>
      ワード生成に失敗しました。
      <Button onClick={() => loadMap(mapData!)} colorScheme="green">
        再試行
      </Button>
    </Flex>
  ) : mapData !== undefined ? (
    "ひらがな判定生成中..."
  ) : (
    "譜面読み込み中..."
  );

  return (
    <Box as="main">
      <LoadingOverlayWrapper
        active={map === null}
        spinner={!tokenizerError}
        text={loadingMessage}
        styles={{
          overlay: (base: React.CSSProperties) => ({
            ...base,
            position: "fixed",
            top: "40px",
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 9999,
          }),
        }}
      />
      <Notifications style={{ height: notificationsHeight }} />
      <ImeTypeYouTubeContent
        videoId={video_id}
        className={"fixed top-[40px] left-0 w-full"}
        style={{ height: youtubeHeight.height, minHeight: youtubeHeight.minHeight }}
      />

      <Flex
        ref={lyricsViewAreaRef}
        width="100%"
        position="fixed"
        bottom={{ base: 0, lg: 100, xl: 150 }}
        left="0"
        flexDirection="column"
      >
        <ViewArea />
        <InputTextarea />
        <MenuBar />
      </Flex>
    </Box>
  );
}

export default Content;
