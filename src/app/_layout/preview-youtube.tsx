"use client";
import { type ExtractAtomValue, useAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import YouTube from "react-youtube";
import { getVolume } from "@/components/shared/volume-range";
import { cn } from "@/lib/tailwind";
import { isDialogOpen } from "@/utils/is-dialog-option";
import { store } from "./store";

const previewVideoInfoAtom = atomWithReset<{
  videoId: string | null;
  previewTime: number | null;
  previewSpeed: number | null;
}>({ videoId: null, previewTime: null, previewSpeed: null });
const previewYTPlayerAtom = atomWithReset<YT.Player | null>(null);

export const usePreviewVideoInfo = () => useAtomValue(previewVideoInfoAtom, { store });
export const getPreviewVideoInfo = () => store.get(previewVideoInfoAtom);
export const setPreviewVideoInfo = (info: ExtractAtomValue<typeof previewVideoInfoAtom>) => {
  store.set(previewVideoInfoAtom, info);

  const { videoId, previewTime } = info;
  if (videoId) {
    const player = getPreviewYTPlayer();
    if (videoId) {
      player?.cueVideoById({ videoId, startSeconds: previewTime ?? 0 });
    }
  }
};
export const resetPreviewVideoInfo = () => {
  store.set(previewVideoInfoAtom, RESET);
  const YTPlayer = getPreviewYTPlayer();
  YTPlayer?.cueVideoById({ videoId: "" });
};

export const usePreviewYTPlayer = () => useAtomValue(previewYTPlayerAtom, { store });
export const getPreviewYTPlayer = () => store.get(previewYTPlayerAtom);
export const setPreviewYTPlayer = (newYTPlayer: YT.Player) => store.set(previewYTPlayerAtom, newYTPlayer);
export const resetPreviewYTPlayer = () => store.set(previewYTPlayerAtom, RESET);

export const PreviewYouTubePlayer = () => {
  const isPreviewEnabled = useIsPreviewEnabled();
  const { videoId } = usePreviewVideoInfo();

  useHotkeys(
    "Escape",
    () => {
      if (isDialogOpen()) return;
      resetPreviewVideoInfo();
    },
    { enableOnFormTags: false, preventDefault: true, enabled: !!videoId && isPreviewEnabled },
  );

  useEffect(() => {
    if (!isPreviewEnabled) {
      resetPreviewVideoInfo();
      resetPreviewYTPlayer();
    }
  }, [isPreviewEnabled]);

  if (!isPreviewEnabled) return null;

  return (
    <YouTube
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
};

const onStateChange = ({ data, target: YTPlayer }: { data: YT.PlayerState; target: YT.Player }) => {
  switch (data) {
    case YT.PlayerState.CUED: {
      const { previewTime } = getPreviewVideoInfo();
      YTPlayer.seekTo(Number(previewTime), true);
      YTPlayer.playVideo();
      break;
    }
  }
};
const onReady = ({ target: YTPlayer }: { target: YT.Player }) => {
  const volume = getVolume();
  YTPlayer.setVolume(volume);
  setPreviewYTPlayer(YTPlayer);
};

const onPlay = ({ target: YTPlayer }: { target: YT.Player }) => {
  const { previewSpeed } = getPreviewVideoInfo();
  YTPlayer.setPlaybackRate(previewSpeed ?? 1);
};

const PREVIEW_EXCLUDED_SEGMENTS = ["type", "edit", "ime"];

export function useIsPreviewEnabled() {
  const pathname = usePathname();
  const firstSegment = pathname.split("/")[1] ?? "";
  const isDisabled = PREVIEW_EXCLUDED_SEGMENTS.includes(firstSegment);

  return !isDisabled;
}
