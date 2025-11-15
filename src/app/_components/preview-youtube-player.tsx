"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import YouTube, { type YouTubeEvent } from "react-youtube";
import { isDialogOpen } from "@/utils/is-dialog-option";
import { readVolume, resetPreviewVideo, setPreviewYTPlayer, usePreviewVideoState } from "../../lib/atoms/global-atoms";

// biome-ignore lint/style/noDefaultExport: <dynamic importを使うため>
export default function PreviewYouTubePlayer() {
  const { videoId, previewTime, previewSpeed } = usePreviewVideoState();
  useHotkeys(
    "Escape",
    () => {
      if (isDialogOpen()) return;
      resetPreviewVideo();
    },
    { enableOnFormTags: false, preventDefault: true, enabled: !!videoId },
  );

  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/type") || pathname.startsWith("/edit") || pathname.startsWith("/ime")) {
      resetPreviewVideo();
    }
  }, [pathname]);

  if (!videoId) return null;

  const onReady = (event: YouTubeEvent) => {
    const YTPlayer = event.target;
    const volume = readVolume();
    YTPlayer.setVolume(volume);
    YTPlayer.seekTo(Number(previewTime), true);
    YTPlayer.playVideo();
    setPreviewYTPlayer(YTPlayer);
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
