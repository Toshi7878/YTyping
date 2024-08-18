import { Image } from "@chakra-ui/next-js";
import { Box, Spinner, useBreakpointValue } from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import { FaPlay } from "react-icons/fa";
import { FaPause } from "react-icons/fa";
import { previewTimeAtom, videoIdAtom } from "../../atoms/atoms";
import { useAtom, useSetAtom } from "jotai";

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
  const [loading, setLoading] = useState(true); // ローディング状態を追加
  const [imgSrc, setImgSrc] = useState(src);
  const [videoId, setVideoId] = useAtom(videoIdAtom);
  const setPreviewTime = useSetAtom(previewTimeAtom);

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

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      const touch = e.changedTouches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLDivElement;
      if (target && target.getAttribute("data-video-id") === videoId) {
        setVideoId(target.getAttribute("data-video-id"));
        setPreviewTime(target.getAttribute("data-preview-time"));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [videoId],
  );

  const handleImageLoad = useCallback((src: string) => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      if (img.width === 120) {
        setImgSrc(fallbackSrc);
      }
      setLoading(false); // 画像がロードされたらローディングを終了
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLoading(true); // 新しい画像をロードする前にローディングを開始
    handleImageLoad(src);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);
  const thubnailWidth = { base: 120, sm: 170, xl: 200 };
  const thubnailHeight = { base: (120 * 9) / 16, sm: (170 * 9) / 16, xl: (200 * 9) / 16 };

  const width = useBreakpointValue(thubnailWidth);
  const height = useBreakpointValue(thubnailHeight);
  return (
    <Box className="relative group" width={width}>
      {loading && (
        <Box className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </Box>
      )}
      <Image
        loader={({ src }) => src}
        alt={alt}
        src={imgSrc}
        width={width}
        height={height} // 16:9の比率で高さを設定
        minW={width}
        minH={height} // 16:9の比率で最小高さを設定
        className="rounded-md"
      />
      <Box
        className={`cursor-pointer absolute inset-0 flex items-center justify-center ${
          videoId === mapVideoId ? "opacity-100" : "opacity-0"
        } group-hover:opacity-100 transition-opacity duration-300`}
        style={{
          backgroundColor: videoId === mapVideoId ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.3)",
          border: "none",
        }}
        borderRadius="lg"
        data-preview-time={mapPreviewTime}
        data-video-id={mapVideoId}
        onClick={previewYouTube}
        onTouchEnd={handleTouchEnd}
      >
        {videoId === mapVideoId ? (
          <FaPause color="white" size={35} />
        ) : (
          <FaPlay color="white" size={35} />
        )}
      </Box>
    </Box>
  );
};

export default MapLeftThumbnail;