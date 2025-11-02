import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { RESET } from "jotai/utils";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";
import { usePreviewVideoState, useSetPreviewVideo } from "@/lib/global-atoms";
import { cn } from "@/lib/utils";
import type { MapListItem } from "@/server/api/routers/map-list";

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
}

const PREVIEW_DISABLE_PATHNAMES = ["type", "edit"];

export const MapLeftThumbnail = (props: MapLeftThumbnailPreviewCoverProps & React.HTMLAttributes<HTMLDivElement>) => {
  const { alt = "", media, size, className, imageClassName, ...rest } = props;

  const src = `https://i.ytimg.com/vi/${media?.videoId}/mqdefault.jpg`;
  const pathname = usePathname();
  const pathSegment = pathname.split("/")[1];

  return (
    <div className={cn("group relative my-auto select-none", className)} {...rest}>
      {media ? (
        <>
          <div className={mapLeftThumbnailVariants({ size })}>
            <Image unoptimized loading="lazy" alt={alt} src={src} fill className={cn("rounded-md", imageClassName)} />
          </div>
          {!PREVIEW_DISABLE_PATHNAMES.includes(pathSegment ?? "") && (
            <ThumbnailPreviewCover {...media} className={imageClassName} />
          )}
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
  const { videoId } = usePreviewVideoState();
  const setPreviewVideo = useSetPreviewVideo();
  const [isTouchMove, setIsTouchMove] = useState(false);

  const previewYouTube = () => {
    if (videoId !== mapVideoId) {
      setPreviewVideo((prev) => ({
        ...prev,
        videoId: mapVideoId,
        previewTime: mapPreviewTime,
        previewSpeed: mapPreviewSpeed ?? 1,
      }));
    } else {
      setPreviewVideo(RESET);
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
        "absolute inset-0 flex cursor-pointer items-center justify-center rounded-lg border-none",
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
