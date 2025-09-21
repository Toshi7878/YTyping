"use client";
import { RESET } from "jotai/utils";
import { useEffect } from "react";
import YouTube, { type YouTubeEvent } from "react-youtube";
import { usePreviewVideoState, useSetPreviewPlayer, useSetPreviewVideo, useVolumeState } from "../../lib/globalAtoms";

const PreviewYouTubePlayer = () => {
  const { videoId, previewTime, previewSpeed } = usePreviewVideoState();

  const volume = useVolumeState();
  const previewYouTubeKeyDown = usePreviewYouTubeKeyDown();
  const setPreviewPlayer = useSetPreviewPlayer();

  useEffect(() => {
    window.addEventListener("keydown", previewYouTubeKeyDown);
    return () => window.removeEventListener("keydown", previewYouTubeKeyDown);
  }, [videoId]);

  if (!videoId) return null;

  const onReady = (event: YouTubeEvent) => {
    const player = event.target;
    player.setVolume(volume);
    player.seekTo(Number(previewTime), true);
    player.playVideo();
    setPreviewPlayer(player);
  };

  const onPlay = (event: YouTubeEvent) => {
    setTimeout(() => event.target.setPlaybackRate(previewSpeed ?? 1), 300);
  };

  return (
    <YouTube
      id="preview_youtube"
      videoId={videoId}
      className="fixed right-2 bottom-2 z-50 lg:right-4 lg:bottom-4 2xl:right-5 2xl:bottom-5 [&_iframe]:h-[128px] [&_iframe]:w-[228px] [&_iframe]:lg:h-[180px] [&_iframe]:lg:w-[320px] [&_iframe]:2xl:h-[252px] [&_iframe]:2xl:w-[448px]"
      opts={{
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

const usePreviewYouTubeKeyDown = () => {
  const setPreviewVideo = useSetPreviewVideo();

  return (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setPreviewVideo(RESET);
    }
  };
};

export default PreviewYouTubePlayer;
