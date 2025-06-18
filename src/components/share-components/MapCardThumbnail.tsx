import { PREVIEW_DISABLE_PATHNAMES } from "@/config/consts/globalConst";
import { usePreviewVideoState, useSetPreviewVideo } from "@/lib/globalAtoms";
import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { RESET } from "jotai/utils";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useCallback, useState } from "react";
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
  mapVideoId?: string;
  mapPreviewTime?: string;
  mapPreviewSpeed?: number;
  size: VariantProps<typeof mapLeftThumbnailVariants>["size"];
}
const MapLeftThumbnail = (props: MapLeftThumbnailPreviewCoverProps & React.HTMLAttributes<HTMLDivElement>) => {
  const { src = "", alt = "", mapVideoId, mapPreviewTime, mapPreviewSpeed = 1, size, ...rest } = props;

  const pathname = usePathname();
  const pathSegment = pathname.split("/")[1];

  return (
    <div className="group relative my-auto select-none" {...rest}>
      {src ? (
        <div className={cn(mapLeftThumbnailVariants({ size }))}>
          <Image unoptimized loading="lazy" alt={alt} src={src} fill className="rounded-md" />
        </div>
      ) : (
        <div className={cn(mapLeftThumbnailVariants({ size }))}>
          <div className="flex-start flex h-full w-full items-center justify-center">{alt}</div>
        </div>
      )}
      {mapVideoId && mapPreviewTime && !PREVIEW_DISABLE_PATHNAMES.includes(pathSegment) && (
        <ThumbnailPreviewCover
          mapPreviewTime={mapPreviewTime}
          mapVideoId={mapVideoId}
          mapPreviewSpeed={mapPreviewSpeed}
        />
      )}
    </div>
  );
};

interface ThumbnailPreviewCoverProps {
  mapVideoId: string;
  mapPreviewTime: string;
  mapPreviewSpeed?: number;
}

const ThumbnailPreviewCover = ({ mapVideoId, mapPreviewTime, mapPreviewSpeed = 1 }: ThumbnailPreviewCoverProps) => {
  const { videoId } = usePreviewVideoState();
  const setPreviewVideoState = useSetPreviewVideo();
  const [isTouchMove, setIsTouchMove] = useState(false);

  const previewYouTube = useCallback(
    () => {
      if (mapVideoId !== videoId) {
        setPreviewVideoState((prev) => ({
          ...prev,
          videoId: mapVideoId,
          previewTime: mapPreviewTime,
          previewSpeed: mapPreviewSpeed.toString(),
        }));
      } else {
        setPreviewVideoState(RESET);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [videoId],
  );

  const handleTouchMove = () => {
    setIsTouchMove(true);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isTouchMove) {
      if (mapVideoId !== videoId) {
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
