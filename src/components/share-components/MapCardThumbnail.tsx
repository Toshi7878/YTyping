import { PREVIEW_DISABLE_PATHNAMES } from "@/config/consts/globalConst";
import { Image } from "@chakra-ui/next-js";
import { Box, BoxProps } from "@chakra-ui/react";
import { $Enums } from "@prisma/client";
import { usePathname } from "next/navigation";
import ThumbnailPreviewCover from "../map-card/child/child/ThumbnailPreviewCover";

interface UseImageSize {
  thumnailWidth: Partial<Record<string, number>>;
  thumnailHeight: Partial<Record<string, number>>;
}
interface MapLeftThumbnailProps extends BoxProps {
  src?: string;
  fallbackSrc?: string;
  alt?: string;
  mapVideoId?: string;
  mapPreviewTime?: string;
  mapPreviewSpeed?: number;
  thumbnailQuality?: $Enums.thumbnail_quality;
}
const MapLeftThumbnail = (props: MapLeftThumbnailProps & UseImageSize) => {
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

  return (
    <Box position="relative" my="auto" className="group select-none" {...rest}>
      {src || fallbackSrc ? (
        <Box
          width={thumnailWidth}
          height={thumnailHeight}
          minW={thumnailWidth}
          minH={thumnailHeight}
          position="relative"
        >
          <Image unoptimized loading="lazy" alt={alt} src={fallbackSrc} rounded={"md"} fill />
        </Box>
      ) : (
        <Box
          width={thumnailWidth}
          height={thumnailHeight}
          minW={thumnailWidth}
          minH={thumnailHeight}
          rounded="md"
        />
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
