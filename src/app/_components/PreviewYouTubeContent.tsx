"use client";

import useBreakPoint from "@/utils/global-hooks/useBreakPoint";
import { useEffect } from "react";
import YouTube, { YouTubeEvent } from "react-youtube";
import { usePreviewVideoState, useSetPreviewPlayer, useVolumeState } from "../../lib/global-atoms/globalAtoms";

const PREVIEW_YOUTUBE_WIDTH = { base: 288, xl: 448 };
const PREVIEW_YOUTUBE_HEIGHT = {
  base: (PREVIEW_YOUTUBE_WIDTH.base * 9) / 16,
  xl: (PREVIEW_YOUTUBE_WIDTH.xl * 9) / 16,
};

const PreviewYouTubeContent = function YouTubeContent() {
  const { videoId, previewTime, previewSpeed } = usePreviewVideoState();

  const volume = useVolumeState();
  const previewYouTubeKeyDown = usePreviewYouTubeKeyDown();
  const setPreviewPlayerState = useSetPreviewPlayer();

  useEffect(() => {
    window.addEventListener("keydown", previewYouTubeKeyDown);

    return () => {
      window.removeEventListener("keydown", previewYouTubeKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  const { breakpoint } = useBreakPoint("desktop");

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
    <YouTube
      id="preview_youtube"
      videoId={videoId}
      className="!lg:w-[448px] fixed right-2 bottom-2 z-10 aspect-video !w-[228px] lg:right-5 lg:bottom-5"
      opts={{
        // width: `${breakpoint === "desktop" ? PREVIEW_YOUTUBE_WIDTH.xl : PREVIEW_YOUTUBE_WIDTH.base}px`,
        // height: `${breakpoint === "desktop" ? PREVIEW_YOUTUBE_HEIGHT.xl : PREVIEW_YOUTUBE_HEIGHT.base}px`,
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
  );
};

import { RESET } from "jotai/utils";
import { useSetPreviewVideo } from "../../lib/global-atoms/globalAtoms";

export const usePreviewYouTubeKeyDown = () => {
  const setPreviewVideo = useSetPreviewVideo();

  return (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setPreviewVideo(RESET);
    }
  };
};

export default PreviewYouTubeContent;
