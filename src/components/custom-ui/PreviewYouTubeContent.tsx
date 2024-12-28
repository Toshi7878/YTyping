"use client";

import {
  PREVIEW_YOUTUBE_HEIGHT,
  PREVIEW_YOUTUBE_POSITION,
  PREVIEW_YOUTUBE_WIDTH,
} from "@/config/global-consts";
import { usePreviewYouTubeKeyDown } from "@/lib/global-hooks/usePreviewYouTubeKeyDown";
import { Box, useBreakpointValue } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import YouTube from "react-youtube";
import {
  usePreviewSpeedAtom,
  usePreviewTimeAtom,
  usePreviewVideoIdAtom,
  useSetPreviewVideoIdAtom,
  useVolumeAtom,
} from "../../lib/global-atoms/globalAtoms";
import { useGlobalRefs } from "../global-provider/GlobalRefProvider";

const PreviewYouTubeContent = function YouTubeContent() {
  const router = useRouter(); // 追加

  const videoId = usePreviewVideoIdAtom();
  const previewTime = usePreviewTimeAtom();
  const previewSpeed = usePreviewSpeedAtom();
  const volume = useVolumeAtom();
  const { setRef } = useGlobalRefs();
  const setPreviewVideoId = useSetPreviewVideoIdAtom();
  const previewYouTubeKeyDown = usePreviewYouTubeKeyDown();

  useEffect(() => {
    window.addEventListener("keydown", previewYouTubeKeyDown);

    return () => {
      window.removeEventListener("keydown", previewYouTubeKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  useEffect(() => {
    return () => {
      setPreviewVideoId(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);
  const width = useBreakpointValue(PREVIEW_YOUTUBE_WIDTH, { ssr: false });
  const height = useBreakpointValue(PREVIEW_YOUTUBE_HEIGHT, { ssr: false });
  const fixedPosition = useBreakpointValue(PREVIEW_YOUTUBE_POSITION, { ssr: false });

  if (!videoId) {
    return null;
  }

  const onReady = (event: any) => {
    event.target.setVolume(volume);
    event.target.seekTo(previewTime);
    event.target.playVideo();
    setRef("playerRef", event.target);
  };
  const onPlay = (event: any) => {
    event.target.setPlaybackRate(previewSpeed);
  };

  return (
    <Box position="fixed" bottom={fixedPosition} right={fixedPosition}>
      <YouTube
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
