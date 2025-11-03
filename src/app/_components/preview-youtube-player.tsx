"use client";
import { useEffect } from "react";
import YouTube, { type YouTubeEvent } from "react-youtube";
import {
  resetPreviewVideo,
  usePreviewVideoState,
  useSetPreviewPlayer,
  useVolumeState,
} from "../../lib/atoms/global-atoms";

const onKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    resetPreviewVideo();
  }
};

// biome-ignore lint/style/noDefaultExport: <dynamic importを使うため>
export default function PreviewYouTubePlayer() {
  const { videoId, previewTime, previewSpeed } = usePreviewVideoState();

  const volume = useVolumeState();
  const setPreviewPlayer = useSetPreviewPlayer();

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [videoId]);

  if (!videoId) return null;

  const onReady = (event: YouTubeEvent) => {
    const YTPlayer = event.target;
    YTPlayer.setVolume(volume);
    YTPlayer.seekTo(Number(previewTime), true);
    YTPlayer.playVideo();
    setPreviewPlayer(YTPlayer);
  };

  const onPlay = (event: YouTubeEvent) => {
    event.target.setPlaybackRate(previewSpeed ?? 1);
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
}
