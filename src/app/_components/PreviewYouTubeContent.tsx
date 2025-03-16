"use client";

import { PREVIEW_YOUTUBE_HEIGHT, PREVIEW_YOUTUBE_WIDTH } from "@/config/consts/globalConst";
import { usePreviewYouTubeKeyDown } from "@/lib/global-hooks/usePreviewYouTubeKeyDown";
import { Box, useBreakpointValue } from "@chakra-ui/react";
import { useEffect } from "react";
import YouTube, { YouTubeEvent } from "react-youtube";
import {
  usePreviewVideoState,
  useSetPreviewPlayerState,
  useVolumeState,
} from "../../lib/global-atoms/globalAtoms";

const PreviewYouTubeContent = function YouTubeContent() {
  const { videoId, previewTime, previewSpeed } = usePreviewVideoState();
  const volume = useVolumeState();
  const previewYouTubeKeyDown = usePreviewYouTubeKeyDown();
  const setPreviewPlayerState = useSetPreviewPlayerState();

  useEffect(() => {
    window.addEventListener("keydown", previewYouTubeKeyDown);

    return () => {
      window.removeEventListener("keydown", previewYouTubeKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  const width = useBreakpointValue(PREVIEW_YOUTUBE_WIDTH, { ssr: false });
  const height = useBreakpointValue(PREVIEW_YOUTUBE_HEIGHT, { ssr: false });

  if (!videoId) {
    return null;
  }

  const onReady = (event) => {
    const player = event.target;
    player.setVolume(volume);
    player.seekTo(Number(previewTime), true);
    player.playVideo();
    setPreviewPlayerState(player);
  };

  const onPlay = (event: YouTubeEvent) => {
    event.target.setPlaybackRate(Number(previewSpeed));
  };

  return (
    <Box zIndex={9} position="fixed" bottom={{ base: 2, lg: 5 }} right={{ base: 2, lg: 5 }}>
      <YouTube
        id="preview_youtube"
        videoId={videoId}
        opts={{
          width: `${width}px`,
          height: `${height}px`,
          playerVars: {
            enablejsapi: 1,
            start: Number(previewTime),
            playsinline: 1,
            autoplay: 1,
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0,
          },
        }}
        onReady={onReady}
        onPlay={onPlay}
      />
    </Box>
  );
};

export default PreviewYouTubeContent;
