import { Image } from "@chakra-ui/next-js";
import { Box, Flex, useBreakpointValue } from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import { FaPlay } from "react-icons/fa";
import { FaPause } from "react-icons/fa";
import { THUBNAIL_HEIGHT, THUBNAIL_WIDTH } from "../../ts/const/consts";
import {
  usePreviewVideoIdAtom,
  useSetPreviewTimeAtom,
  useSetPreviewVideoIdAtom,
} from "@/components/atom/globalAtoms";

interface MapLeftThumbnailProps {
  src: string;
  fallbackSrc: string;
  alt: string;
  mapVideoId: string;
  mapPreviewTime: string;
  thumbnailQuality: "maxresdefault" | "mqdefault";
}

const MapLeftThumbnail = (props: MapLeftThumbnailProps) => {
  const { src, fallbackSrc, alt, mapVideoId, mapPreviewTime } = props;
  const [imgSrc, setImgSrc] = useState(src);
  const videoId = usePreviewVideoIdAtom();
  const [isTouchMove, setIsTouchMove] = useState(false);

  const setVideoId = useSetPreviewVideoIdAtom();
  const setPreviewTime = useSetPreviewTimeAtom();

  const previewYouTube = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      const target = e.currentTarget as HTMLDivElement;
      const targetPreviewTime = target.getAttribute("data-preview-time");
      const targetVideoId = target.getAttribute("data-video-id");

      if (targetVideoId !== videoId) {
        setVideoId(targetVideoId);
        setPreviewTime(targetPreviewTime);
      } else {
        setVideoId(null);
        setPreviewTime(null);
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
      previewYouTube(e);
    }
    setIsTouchMove(false);
  };

  const handleImageLoad = useCallback((src: string) => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      if (img.width === 120) {
        setImgSrc(fallbackSrc);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    handleImageLoad(src);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const width = useBreakpointValue(THUBNAIL_WIDTH);
  const height = useBreakpointValue(THUBNAIL_HEIGHT);
  return (
    <Box position="relative" className="group" width={width} style={{ userSelect: "none" }}>
      <Image
        loader={({ src }) => src}
        alt={alt}
        src={imgSrc}
        width={width}
        height={height}
        minW={width}
        minH={height}
        className="rounded-md"
      />
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
        data-preview-time={mapPreviewTime}
        data-video-id={mapVideoId}
        onClick={previewYouTube}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {videoId === mapVideoId ? (
          <FaPause color="white" size={35} />
        ) : (
          <FaPlay color="white" size={35} />
        )}
      </Flex>
    </Box>
  );
};

export default MapLeftThumbnail;
