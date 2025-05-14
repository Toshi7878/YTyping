"use client";
import { RouterOutPuts } from "@/server/api/trpc";
import { Box, Flex } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import LyricsTextarea from "../_components/lyrics-input-area/LyricsTextarea";
import LyricsViewArea from "../_components/lyrics-view-area/LyricsViewArea";
import MenuBar from "../_components/memu/MenuBar";
import ImeTypeYouTubeContent from "../_components/youtube-content/ImeTypeYoutubeContent";

interface ContentProps {
  mapInfo: RouterOutPuts["map"]["getMapInfo"];
}

function Content({ mapInfo }: ContentProps) {
  const { video_id } = mapInfo!;
  const lyricsViewAreaRef = useRef<HTMLDivElement>(null);
  const [youtubeHeight, setYoutubeHeight] = useState<string>("calc(100vh - var(--header-height))");

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
        <MenuBar />
        <LyricsTextarea />
      </Flex>
    </Box>
  );
}

export default Content;
