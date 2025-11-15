"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import YouTube from "react-youtube";
import { cn } from "@/lib/utils";
import { isDialogOpen } from "@/utils/is-dialog-option";
import {
  readPreviewVideoInfo,
  readVolume,
  resetPreviewVideoInfo,
  resetPreviewYTPlayer,
  setPreviewYTPlayer,
  usePreviewVideoInfoState,
} from "../../lib/atoms/global-atoms";

// biome-ignore lint/style/noDefaultExport: <dynamic importを使うため>
export default function PreviewYouTubePlayer() {
  const pathname = usePathname();
  const isPreviewPage = !pathname.startsWith("/type") && !pathname.startsWith("/edit") && !pathname.startsWith("/ime");

  const { videoId } = usePreviewVideoInfoState();

  useHotkeys(
    "Escape",
    () => {
      if (isDialogOpen()) return;
      resetPreviewVideoInfo();
    },
    { enableOnFormTags: false, preventDefault: true, enabled: !!videoId && isPreviewPage },
  );

  useEffect(() => {
    if (!isPreviewPage) {
      resetPreviewVideoInfo();
      resetPreviewYTPlayer();
    }
  }, [isPreviewPage]);

  if (!isPreviewPage) return null;

  return (
    <YouTube
      id="preview_youtube"
      videoId=""
      className={cn(
        "fixed right-2 bottom-2 z-50 lg:right-4 lg:bottom-4 2xl:right-5 2xl:bottom-5 [&_iframe]:h-[128px] [&_iframe]:w-[228px] [&_iframe]:lg:h-[180px] [&_iframe]:lg:w-[320px] [&_iframe]:2xl:h-[252px] [&_iframe]:2xl:w-[448px]",
        videoId ? "visible" : "hidden",
      )}
      opts={{
        playerVars: {
          enablejsapi: 1,
          playsinline: 1,
          autoplay: 1,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
        },
      }}
      onReady={onReady}
      onPlay={onPlay}
      onStateChange={onStateChange}
    />
  );
}

const onStateChange = ({ data, target: YTPlayer }: { data: YT.PlayerState; target: YT.Player }) => {
  console.log("onStateChange", data);

  switch (data) {
    case YT.PlayerState.CUED: {
      const { previewTime } = readPreviewVideoInfo();
      YTPlayer.seekTo(Number(previewTime), true);
      YTPlayer.playVideo();
      break;
    }
  }
};
const onReady = ({ target: YTPlayer }: { target: YT.Player }) => {
  const volume = readVolume();
  YTPlayer.setVolume(volume);
  setPreviewYTPlayer(YTPlayer);
};

const onPlay = ({ target: YTPlayer }: { target: YT.Player }) => {
  const { previewSpeed } = readPreviewVideoInfo();
  YTPlayer.setPlaybackRate(previewSpeed ?? 1);
};
