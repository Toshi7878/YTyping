import { PREVIEW_DISABLE_PATHNAMES } from "@/config/consts/globalConst";
import { Image } from "@chakra-ui/next-js";
import { Box, BoxProps, useBreakpointValue } from "@chakra-ui/react";
import { $Enums } from "@prisma/client";
import { usePathname } from "next/navigation";
import ThumbnailPreviewCover from "../map-card/child/child/ThumbnailPreviewCover";

interface MapLeftThumbnailProps extends BoxProps {
  src?: string;
  fallbackSrc?: string;
  alt?: string;
  mapVideoId?: string;
  mapPreviewTime?: string;
  mapPreviewSpeed?: number;
  thumbnailQuality?: $Enums.thumbnail_quality;
  thumnailWidth: Partial<Record<string, number>>;
  thumnailHeight: Partial<Record<string, number>>;
}
const MapLeftThumbnail = (props: MapLeftThumbnailProps) => {
  const {
    src = "",
    fallbackSrc = "",
    alt = "",
    mapVideoId,
    mapPreviewTime,
    mapPreviewSpeed = 1,
    thumbnailQuality,
    thumnailWidth,
    thumnailHeight,
    ...rest
  } = props;

  const pathname = usePathname();
  const pathSegment = pathname.split("/")[1];

  const width = useBreakpointValue(thumnailWidth, { ssr: false }) || 100; // ここを変更
  const height = useBreakpointValue(thumnailHeight, { ssr: false }) || 100; // ここを変更
  return (
    <Box position="relative" my="auto" className="group select-none" {...rest}>
      {src || fallbackSrc ? (
        <Image
          loader={({ src }) => src}
          alt={alt}
          src={fallbackSrc}
          width={width}
          height={height}
          minW={width}
          minH={height}
          rounded="md"
        />
      ) : (
        <Box width={width} height={height} minW={width} minH={height} rounded="md" />
      )}
      {mapVideoId && mapPreviewTime && !PREVIEW_DISABLE_PATHNAMES.includes(pathSegment) && (
        <ThumbnailPreviewCover
          mapPreviewTime={mapPreviewTime}
          mapVideoId={mapVideoId}
          mapPreviewSpeed={mapPreviewSpeed}
        />
      )}
    </Box>
  );
};

export default MapLeftThumbnail;
