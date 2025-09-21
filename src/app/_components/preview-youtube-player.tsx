"use client";
import { cn } from "@/lib/utils";
import { atom, getDefaultStore, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import YouTube, { type YouTubeEvent } from "react-youtube";
import { usePreviewVideoState, useSetPreviewPlayer, useSetPreviewVideo, useVolumeState } from "../../lib/globalAtoms";

const previewIsHiddenAtom = atom(true);
const usePreviewIsHidden = () => useAtomValue(previewIsHiddenAtom, { store: getDefaultStore() });
export const useSetPreviewIsHidden = () => useSetAtom(previewIsHiddenAtom, { store: getDefaultStore() });

const PreviewYouTubePlayer = () => {
  const { videoId, previewTime, previewSpeed } = usePreviewVideoState();
  const isHidden = usePreviewIsHidden();
  const setPreviewIsHidden = useSetPreviewIsHidden();

  const volume = useVolumeState();
  const previewYouTubeKeyDown = usePreviewYouTubeKeyDown();
  const setPreviewPlayer = useSetPreviewPlayer();

  useEffect(() => {
    window.addEventListener("keydown", previewYouTubeKeyDown);
    return () => window.removeEventListener("keydown", previewYouTubeKeyDown);
  }, [videoId]);

  // if (!videoId) return null;

  const onReady = (event: YouTubeEvent) => {
    const player = event.target;
    player.setVolume(volume);
    player.seekTo(Number(previewTime), true);
    player.playVideo();
    setPreviewPlayer(player);
    console.log("onReady");
  };

  const onStateChange = (event: YouTubeEvent) => {
    console.log("onStateChange", event);

    switch (event.data) {
      case -1:
        break;
      case 1:
        break;
      case 3:
        break;
      case 5:
        event.target.playVideo();
        event.target.seekTo(Number(previewTime), true);
        break;
    }
  };

  const onPlay = (event: YouTubeEvent) => {
    setPreviewIsHidden(false);

    event.target.setPlaybackRate(Number(previewSpeed));
  };

  return (
    <YouTube
      id="preview_youtube"
      // videoId={videoId ?? undefined}
      className={cn(
        "fixed right-2 bottom-2 z-50 lg:right-4 lg:bottom-4 2xl:right-5 2xl:bottom-5 [&_iframe]:h-[128px] [&_iframe]:w-[228px] [&_iframe]:lg:h-[180px] [&_iframe]:lg:w-[320px] [&_iframe]:2xl:h-[252px] [&_iframe]:2xl:w-[448px]",
        isHidden ? "hidden" : "block",
      )}
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
      onStateChange={onStateChange}
    />
  );
};

const usePreviewYouTubeKeyDown = () => {
  const setPreviewVideo = useSetPreviewVideo();
  const setPreviewIsHidden = useSetPreviewIsHidden();

  return (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setPreviewIsHidden(true);
      setPreviewVideo((prev) => {
        return {
          ...prev,
          videoId: "",
          previewTime: 0,
          previewSpeed: 1,
        };
      });
    }
  };
};

export default PreviewYouTubePlayer;
