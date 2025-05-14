"use client";
import { RouterOutPuts } from "@/server/api/trpc";
import { Box, Flex } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import LyricsTextarea from "../_components/lyrics-input-area/LyricsTextarea";
import MenuBar from "../_components/memu/MenuBar";
import ImeTypeYouTubeContent from "../_components/youtube-content/ImeTypeYoutubeContent";

interface ContentProps {
  mapInfo: RouterOutPuts["map"]["getMapInfo"];
}

function Content({ mapInfo }: ContentProps) {
  const { video_id } = mapInfo!;
  const menubarRef = useRef<HTMLDivElement>(null);
  const lyricsInputRef = useRef<HTMLDivElement>(null);
  const lyricsViewAreaRef = useRef<HTMLDivElement>(null);
  const [youtubeHeight, setYoutubeHeight] = useState<string>("calc(100vh - var(--header-height))");

  useEffect(() => {
    const lyricsViewAreaElement = lyricsViewAreaRef.current;
    if (!lyricsViewAreaElement) return;

    // 初期高さ計算
    const updateHeight = () => {
      const lyricsViewAreaHeight = lyricsViewAreaElement.offsetHeight || 0;

      // bottomの値を動的に取得
      const computedStyle = window.getComputedStyle(lyricsViewAreaElement);
      const bottomValue = computedStyle.bottom;
      const bottomPx = bottomValue === "auto" ? 0 : parseInt(bottomValue, 10) || 0;

      const newHeight = `calc(100vh - 40px - ${lyricsViewAreaHeight}px - ${bottomPx}px)`;
      setYoutubeHeight(newHeight);
    };

    // 初回実行
    updateHeight();

    // ResizeObserverの設定
    const resizeObserver = new ResizeObserver(updateHeight);

    // 要素の監視を開始
    resizeObserver.observe(lyricsViewAreaElement);

    // アンマウント時にオブザーバーをクリーンアップ
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <Box>
      <ImeTypeYouTubeContent
        videoId={video_id}
        isMapLoading={false}
        className={"fixed top-[40px] left-0 w-full"}
        style={{ height: youtubeHeight }}
      />
      <Flex
        ref={lyricsViewAreaRef}
        width="100%"
        position="fixed"
        bottom="20"
        left="0"
        borderRadius={1}
        flexDirection="column"
      >
        {/* <LyricsViewArea /> */}
        <MenuBar menubarRef={menubarRef} />
        <LyricsTextarea lyricsInputRef={lyricsInputRef} />
      </Flex>
    </Box>
  );
}

export default Content;
