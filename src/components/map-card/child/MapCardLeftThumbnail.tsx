import { PREVIEW_DISABLE_PATHNAMES } from "@/config/global-consts";
import { Image } from "@chakra-ui/next-js";
import { Box, BoxProps, useBreakpointValue } from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import ThumbnailPreviewCover from "./child/ThumbnailPreviewCover";

interface MapLeftThumbnailProps extends BoxProps {
  src?: string;
  fallbackSrc?: string;
  alt?: string;
  mapVideoId?: string;
  mapPreviewTime?: string;
  mapPreviewSpeed?: number;
  thumbnailQuality?: string;
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

  // const [imgSrc, setImgSrc] = useState(fallbackSrc); //高画質: src 低画質: fallbackSrc

  // const handleImageLoad = useCallback((src: string) => {
  //   const img = new window.Image();
  //   img.src = src;
  //   img.onload = () => {
  //     if (img.width === 120) {
  //       setImgSrc(fallbackSrc);
  //     }
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // useEffect(() => {
  //   handleImageLoad(src);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [src]);

  const width = useBreakpointValue(thumnailWidth, { ssr: false }) || 100; // ここを変更
  const height = useBreakpointValue(thumnailHeight, { ssr: false }) || 100; // ここを変更
  return (
    <Box position="relative" className="group select-none" {...rest}>
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
