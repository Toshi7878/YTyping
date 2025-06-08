import { usePreviewVideoState, useSetPreviewVideo } from "@/lib/global-atoms/globalAtoms";
import { cn } from "@/lib/utils";
import { RESET } from "jotai/utils";
import React, { useCallback, useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";

interface MapLeftThumbnailProps {
  mapVideoId: string;
  mapPreviewTime: string;
  mapPreviewSpeed?: number;
}

const ThumbnailPreviewCover = ({ mapVideoId, mapPreviewTime, mapPreviewSpeed = 1 }: MapLeftThumbnailProps) => {
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
        "absolute inset-0 flex cursor-pointer items-center justify-center rounded-lg border-none transition-opacity duration-300",
        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
      )}
      style={{
        backgroundColor: isActive ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.3)",
      }}
      onClick={previewYouTube}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isActive ? <FaPause color="white" size={35} /> : <FaPlay color="white" size={35} />}
    </div>
  );
};

export default ThumbnailPreviewCover;
