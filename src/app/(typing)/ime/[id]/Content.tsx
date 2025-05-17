"use client";
import { RouterOutPuts } from "@/server/api/trpc";
import { useMapQuery } from "@/util/global-hooks/query/mapRouterQuery";
import { Box, Flex } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import LoadingOverlayWrapper from "react-loading-overlay-ts";
import LyricsTextarea from "../_components/lyrics-input-area/LyricsTextarea";
import LyricsViewArea from "../_components/lyrics-view-area/LyricsViewArea";
import MenuBar from "../_components/memu/MenuBar";
import Notifications from "../_components/notifications/Notifications";
import ImeTypeYouTubeContent from "../_components/youtube-content/ImeTypeYoutubeContent";
import { useMapState, useSetMap } from "../atom/stateAtoms";
import { useParseImeMap } from "../hooks/parseImeMap";
import { usePathChangeAtomReset } from "../hooks/reset";

interface ContentProps {
  mapInfo: RouterOutPuts["map"]["getMapInfo"];
}

function Content({ mapInfo }: ContentProps) {
  const { video_id } = mapInfo!;
  const lyricsViewAreaRef = useRef<HTMLDivElement>(null);
  const [youtubeHeight, setYoutubeHeight] = useState<string>("calc(100vh - var(--header-height))");
  const [notificationsHeight, setNotificationsHeight] = useState<string>("calc(100vh - var(--header-height))");
  const { id: mapId } = useParams();
  const { data: mapData } = useMapQuery({ mapId: mapId as string });
  const setMap = useSetMap();
  const parseImeMap = useParseImeMap();
  const map = useMapState();
  const pathChangeAtomReset = usePathChangeAtomReset();

  useEffect(() => {
    if (mapData) {
      const loadMap = async () => {
        const map = await parseImeMap(mapData);
        setMap(map);
      };

      loadMap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapData]);

  useEffect(() => {
    return () => {
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

      setYoutubeHeight(`calc(100vh - 40px - ${lyricsViewAreaHeight}px - ${bottomPx}px)`);
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
  }, []);

  const loadingMessage = mapData !== undefined ? "ひらがな判定生成中..." : "譜面読み込み中...";

  return (
    <Box as="main">
      <LoadingOverlayWrapper
        active={map === null}
        spinner={true}
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
        style={{ height: youtubeHeight }}
      />

      <Flex ref={lyricsViewAreaRef} width="100%" position="fixed" bottom="140" left="0" flexDirection="column">
        <LyricsViewArea />
        <LyricsTextarea />
        <MenuBar />
      </Flex>
    </Box>
  );
}

export default Content;
