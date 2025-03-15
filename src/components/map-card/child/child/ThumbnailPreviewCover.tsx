import { usePreviewVideoState, useSetPreviewVideoState } from "@/lib/global-atoms/globalAtoms";
import { Flex } from "@chakra-ui/react";
import { RESET } from "jotai/utils";
import React, { useCallback, useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";

interface MapLeftThumbnailProps {
  mapVideoId: string;
  mapPreviewTime: string;
  mapPreviewSpeed?: number;
}
const ThumbnailPreviewCover = (props: MapLeftThumbnailProps) => {
  const { mapVideoId, mapPreviewTime, mapPreviewSpeed = 1 } = props;
  const { videoId, previewTime, previewSpeed } = usePreviewVideoState();
  const setPreviewVideoState = useSetPreviewVideoState();
  const [isTouchMove, setIsTouchMove] = useState(false);

  const previewYouTube = useCallback(
    () => {
      if (mapVideoId !== videoId) {
        setPreviewVideoState({
          videoId: mapVideoId,
          previewTime: mapPreviewTime,
          previewSpeed: mapPreviewSpeed.toString(),
        });
      } else {
        setPreviewVideoState(RESET);
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [videoId]
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

  return (
    <Flex
      cursor="pointer"
      position="absolute"
      alignItems="center"
      justify="center"
      inset={0}
      opacity={videoId === mapVideoId ? 1 : 0}
      _groupHover={{ opacity: 1 }}
      transition="opacity 0.3s"
      style={{
        backgroundColor: videoId === mapVideoId ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.3)",
        border: "none",
      }}
      borderRadius="lg"
      onClick={previewYouTube}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {videoId === mapVideoId ? <FaPause color="white" size={35} /> : <FaPlay color="white" size={35} />}
    </Flex>
  );
};

export default ThumbnailPreviewCover;
