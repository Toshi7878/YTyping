import { usePreviewVideoState, useSetPreviewVideo } from "@/lib/globalAtoms";
import { cn } from "@/lib/utils";
import { MapListItem } from "@/server/api/routers/map-list";
import { cva, VariantProps } from "class-variance-authority";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";

const mapLeftThumbnailVariants = cva("relative", {
  variants: {
    size: {
      home: "aspect-video w-[160px] sm:w-[220px]",
      timeline: "aspect-video w-[120px]",
      activeUser: "aspect-video w-[120px]",
      notification: "aspect-video w-[150px]",
    },
  },
});

interface MapLeftThumbnailPreviewCoverProps {
  src?: string;
  alt?: string;
  media?: MapListItem["media"];
  size: VariantProps<typeof mapLeftThumbnailVariants>["size"];
  className?: string;
}

const PREVIEW_DISABLE_PATHNAMES = ["type", "edit"];

const MapLeftThumbnail = (props: MapLeftThumbnailPreviewCoverProps & React.HTMLAttributes<HTMLDivElement>) => {
  const { alt = "", media, size, className, ...rest } = props;

  const src = `https://i.ytimg.com/vi/${media?.videoId}/mqdefault.jpg`;
  const pathname = usePathname();
  const pathSegment = pathname.split("/")[1];

  return (
    <div className={cn("group relative my-auto select-none", className)} {...rest}>
      {media ? (
        <>
          <div className={cn(mapLeftThumbnailVariants({ size }))}>
            <Image unoptimized loading="lazy" alt={alt} src={src} fill className="rounded-md" />
          </div>
          {!PREVIEW_DISABLE_PATHNAMES.includes(pathSegment) && <ThumbnailPreviewCover {...media} />}
        </>
      ) : (
        <div className={cn(mapLeftThumbnailVariants({ size }))}>
          <div className="flex-start flex h-full w-full items-center justify-center">{alt}</div>
        </div>
      )}
    </div>
  );
};

const ThumbnailPreviewCover = (props: MapListItem["media"]) => {
  const { videoId: mapVideoId, previewTime: mapPreviewTime, previewSpeed: mapPreviewSpeed } = props;
  const { videoId, player } = usePreviewVideoState();
  const setPreviewVideo = useSetPreviewVideo();
  const [isTouchMove, setIsTouchMove] = useState(false);

  const previewYouTube = async () => {
    if (videoId !== mapVideoId) {
      setPreviewVideo((prev) => ({
        ...prev,
        videoId: mapVideoId,
        previewTime: mapPreviewTime,
        previewSpeed: mapPreviewSpeed ?? 1,
      }));
      player?.cueVideoById({
        videoId: mapVideoId,
        startSeconds: mapPreviewTime,
        suggestedQuality: "small",
      });

      // await new Promise((resolve) => setTimeout(resolve, 120));
      // player?.playVideo();
    } else {
      player?.pauseVideo();
      setPreviewVideo((prev) => ({
        ...prev,
        videoId: "",
        previewTime: 0,
        previewSpeed: 1,
      }));
    }
  };

  const handleTouchMove = () => {
    setIsTouchMove(true);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
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
      )}
      onClick={previewYouTube}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isActive ? <FaPause color="white" size={35} /> : <FaPlay color="white" size={35} />}
    </div>
  );
};

export default MapLeftThumbnail;
