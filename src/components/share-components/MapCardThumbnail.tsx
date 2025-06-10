import { PREVIEW_DISABLE_PATHNAMES } from "@/config/consts/globalConst";
import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import Image from "next/image";
import { usePathname } from "next/navigation";
import ThumbnailPreviewCover from "../map-card/child/child/ThumbnailPreviewCover";

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

interface MapLeftThumbnailProps {
  src?: string;
  alt?: string;
  mapVideoId?: string;
  mapPreviewTime?: string;
  mapPreviewSpeed?: number;
  size: VariantProps<typeof mapLeftThumbnailVariants>["size"];
}
const MapLeftThumbnail = (props: MapLeftThumbnailProps & React.HTMLAttributes<HTMLDivElement>) => {
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
        <div className={cn(mapLeftThumbnailVariants({ size }))} />
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

export default MapLeftThumbnail;
