import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import Image from "next/image";
import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const thumbnailImageVariants = cva("relative aspect-video rounded-md overflow-hidden", {
  variants: {
    size: {
      md: "w-[160px] sm:w-[224px]",
      sm: "w-[160px]",
      xs: "w-[120px]",
      "2xs": "w-[96px] rounded-sm",
      "3xs": "w-[64px] rounded-xs",
    },
  },
});

interface ThumbnailImageBaseProps {
  size: VariantProps<typeof thumbnailImageVariants>["size"];
  className?: string;
  priority?: boolean;
}

type ThumbnailImageProps = ThumbnailImageBaseProps &
  ({ src: string; alt: string; fallback?: ReactNode } | { src?: string; alt?: string; fallback: ReactNode });

export const ThumbnailImage = (props: ThumbnailImageProps) => {
  const { src, alt, size, className, priority = false, fallback } = props;
  const [isImageLoaded, setIsImageLoaded] = useState(priority);

  if (!src || typeof alt !== "string") {
    return (
      <div className={cn(thumbnailImageVariants({ size }), "flex items-center justify-center bg-muted/50", className)}>
        {fallback}
      </div>
    );
  }

  return (
    <div className={thumbnailImageVariants({ size })}>
      <Image
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        preload={priority}
        src={src}
        fill
        onLoad={() => setIsImageLoaded(true)}
        onError={() => setIsImageLoaded(true)}
        className={cn(
          className,
          !priority && "opacity-0 transition-opacity duration-200 will-change-opacity",
          !priority && isImageLoaded && "opacity-100",
        )}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
};
