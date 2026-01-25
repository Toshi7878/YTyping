import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { Palette } from "lucide-react";
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
import type { MapListItem } from "@/server/api/routers/map";
import { buildYouTubeThumbnailUrl } from "@/utils/ytimg";
import { TooltipWrapper } from "../ui/tooltip";

const mapLeftThumbnailVariants = cva("relative aspect-video", {
  variants: {
    size: {
      home: "w-[160px] sm:w-[224px]",
      sm: "w-[160px]",
      xs: "w-[120px]",
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
  priority?: boolean;
  isStyledMap?: boolean;
}

export const MapLeftThumbnail = (props: MapLeftThumbnailPreviewCoverProps & React.HTMLAttributes<HTMLDivElement>) => {
  const { alt = "", media, size, className, imageClassName, priority = false, ...rest } = props;

  const isPreviewEnabled = useIsPreviewEnabled();
  const previewYTPlayer = usePreviewPlayerState();
  const shouldFadeIn = !priority;
  const [isImageLoaded, setIsImageLoaded] = useState(!shouldFadeIn);

  return (
    <div className={cn("group relative my-auto select-none", className)} {...rest}>
      {media ? (
        <>
          {isPreviewEnabled && previewYTPlayer && <ThumbnailPreviewCover {...media} className={imageClassName} />}
          {props.isStyledMap && <StyledMapBadge />}
          <div className={mapLeftThumbnailVariants({ size })}>
            <Image
              alt={alt}
              loading={priority ? "eager" : "lazy"}
              preload={priority}
              src={buildYouTubeThumbnailUrl(media.videoId, "mqdefault")}
              fill
              onLoad={() => setIsImageLoaded(true)}
              onError={() => setIsImageLoaded(true)}
              className={cn(
                "rounded-md",
                imageClassName,
                shouldFadeIn && "opacity-0 transition-opacity duration-200 will-change-opacity",
                shouldFadeIn && isImageLoaded && "opacity-100",
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </>
      ) : (
        <div className={cn(mapLeftThumbnailVariants({ size }))}>
          <div className="flex h-full w-full flex-start items-center justify-center">{alt}</div>
        </div>
      )}
    </div>
  );
};

const StyledMapBadge = () => {
  return (
    <TooltipWrapper label="装飾譜面">
      <div className="absolute top-2 left-2 z-10 inline-flex">
        <Palette className="size-5 rounded-full bg-black/70 p-1" />
      </div>
    </TooltipWrapper>
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
    <button
      type="button"
      className={cn(
        "absolute inset-0 z-1 inline-flex size-full cursor-pointer items-center justify-center overflow-hidden rounded-md",
        isActive ? "bg-black/50 opacity-100" : "bg-black/30 opacity-0 group-hover:opacity-100",
        props.className,
      )}
      onClick={previewYouTube}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isActive ? <FaPause color="white" size={35} /> : <FaPlay color="white" size={35} />}
    </button>
  );
};
