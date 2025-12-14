import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import Image from "next/image";
import type React from "react";
import { useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";
import { useIsPreviewEnabled } from "@/app/_components/preview-youtube-player";
import {
  readPreviewYTPlayer,
  resetPreviewVideoInfo,
  setPreviewVideoInfo,
  usePreviewPlayerState,
  usePreviewVideoInfoState,
} from "@/lib/atoms/global-atoms";
import { cn } from "@/lib/utils";
import type { MapListItem } from "@/server/api/routers/map/list";
import { buildYouTubeThumbnailUrl } from "@/utils/ytimg";

const mapLeftThumbnailVariants = cva("relative aspect-video", {
  variants: {
    size: {
      home: "w-[160px] sm:w-[220px]",
      timeline: "w-[120px]",
      activeUser: "w-[120px]",
      notification: "w-[160px]",
    },
  },
});

interface MapLeftThumbnailPreviewCoverProps {
  src?: string;
  alt?: string;
  media?: MapListItem["media"];
  size: VariantProps<typeof mapLeftThumbnailVariants>["size"];
  className?: string;
  imageClassName?: string;
  loading?: "eager" | "lazy";
}

export const MapLeftThumbnail = (props: MapLeftThumbnailPreviewCoverProps & React.HTMLAttributes<HTMLDivElement>) => {
  const { alt = "", media, size, className, imageClassName, loading = "lazy", ...rest } = props;

  const isPreviewEnabled = useIsPreviewEnabled();
  const previewYTPlayer = usePreviewPlayerState();

  return (
    <div className={cn("group relative my-auto select-none", className)} {...rest}>
      {media ? (
        <>
          {isPreviewEnabled && previewYTPlayer && <ThumbnailPreviewCover {...media} className={imageClassName} />}
          <div className={mapLeftThumbnailVariants({ size })}>
            <Image
              loading={loading}
              alt={alt}
              src={buildYouTubeThumbnailUrl(media.videoId, "mqdefault")}
              fill
              className={cn("rounded-md", imageClassName)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </>
      ) : (
        <div className={cn(mapLeftThumbnailVariants({ size }))}>
          <div className="flex-start flex h-full w-full items-center justify-center">{alt}</div>
        </div>
      )}
    </div>
  );
};

const ThumbnailPreviewCover = (props: MapListItem["media"] & { className?: string }) => {
  const { videoId: mapVideoId, previewTime: mapPreviewTime, previewSpeed: mapPreviewSpeed } = props;
  const { videoId } = usePreviewVideoInfoState();
  const [isTouchMove, setIsTouchMove] = useState(false);

  const previewYouTube = () => {
    if (videoId !== mapVideoId) {
      if (!readPreviewYTPlayer()) return;
      setPreviewVideoInfo({
        videoId: mapVideoId,
        previewTime: mapPreviewTime,
        previewSpeed: mapPreviewSpeed ?? 1,
      });
    } else {
      resetPreviewVideoInfo();
    }
  };

  const handleTouchMove = () => {
    setIsTouchMove(true);
  };

  const handleTouchEnd = () => {
    if (!isTouchMove) {
      if (videoId !== mapVideoId) {
        previewYouTube();
      }
    }
    setIsTouchMove(false);
  };

  const isActive = videoId === mapVideoId;

  return (
    <div
      className={cn(
        "z-1 absolute inset-0 flex cursor-pointer items-center justify-center rounded-lg border-none",
        isActive ? "bg-black/50 opacity-100" : "bg-black/30 opacity-0 group-hover:opacity-100",
        props.className,
      )}
      onClick={previewYouTube}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isActive ? <FaPause color="white" size={35} /> : <FaPlay color="white" size={35} />}
    </div>
  );
};
