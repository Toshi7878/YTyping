"use client";
import { RouterOutPuts } from "@/server/api/trpc";
import { useMapQuery } from "@/util/global-hooks/query/mapRouterQuery";
import { Box, Flex } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import LyricsTextarea from "../_components/lyrics-input-area/LyricsTextarea";
import LyricsViewArea from "../_components/lyrics-view-area/LyricsViewArea";
import MenuBar from "../_components/memu/MenuBar";
import ImeTypeYouTubeContent from "../_components/youtube-content/ImeTypeYoutubeContent";
import { useSetMap } from "../atom/stateAtoms";
import { useParseImeMap } from "../hooks/parseImeMap";

interface ContentProps {
  mapInfo: RouterOutPuts["map"]["getMapInfo"];
}

function Content({ mapInfo }: ContentProps) {
  const { video_id } = mapInfo!;
  const lyricsViewAreaRef = useRef<HTMLDivElement>(null);
  const [youtubeHeight, setYoutubeHeight] = useState<string>("calc(100vh - var(--header-height))");
  const { id: mapId } = useParams();
  const { data: mapData, isLoading } = useMapQuery({ mapId: mapId as string });
  const setMap = useSetMap();
  const parseImeMap = useParseImeMap();

  useEffect(() => {
    if (mapData) {
      const loadMap = async () => {
        const map = await parseImeMap(mapData);
        setMap(map);
        console.log(map);
      };

      loadMap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapData]);

  useEffect(() => {
    const lyricsViewAreaElement = lyricsViewAreaRef.current;
    if (!lyricsViewAreaElement) return;

    const lyricsViewAreaHeight = lyricsViewAreaElement.offsetHeight || 0;

    const computedStyle = window.getComputedStyle(lyricsViewAreaElement);
    const bottomValue = computedStyle.bottom;
    const bottomPx = bottomValue === "auto" ? 0 : parseInt(bottomValue, 10) || 0;

    const newHeight = `calc(100vh - 40px - ${lyricsViewAreaHeight}px - ${bottomPx}px)`;
    setYoutubeHeight(newHeight);
  }, []);

  return (
    <Box>
      <ImeTypeYouTubeContent
        videoId={video_id}
        isMapLoading={false}
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
