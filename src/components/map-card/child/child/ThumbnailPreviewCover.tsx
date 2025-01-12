import {
  usePreviewVideoIdAtom,
  useSetPreviewSpeedAtom,
  useSetPreviewTimeAtom,
  useSetPreviewVideoIdAtom,
} from "@/lib/global-atoms/globalAtoms";
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
  const videoId = usePreviewVideoIdAtom();
  const [isTouchMove, setIsTouchMove] = useState(false);

  const setVideoId = useSetPreviewVideoIdAtom();
  const setPreviewTime = useSetPreviewTimeAtom();
  const setPreviewSpeed = useSetPreviewSpeedAtom();

  const previewYouTube = useCallback(
    () => {
      if (!isTouchMove) {
        if (mapVideoId !== videoId) {
          setVideoId(mapVideoId);
          setPreviewTime(mapPreviewTime);
        } else {
          setVideoId(null);
          setPreviewTime(RESET);
        }
        setPreviewSpeed(mapPreviewSpeed);
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [videoId, isTouchMove]
  );
  const handleTouchMove = () => {
    setIsTouchMove(true);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isTouchMove) {
      previewYouTube();
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
      // onTouchEnd={handleTouchEnd}
    >
      {videoId === mapVideoId ? (
        <FaPause color="white" size={35} />
      ) : (
        <FaPlay color="white" size={35} />
      )}
    </Flex>
  );
};

export default ThumbnailPreviewCover;
