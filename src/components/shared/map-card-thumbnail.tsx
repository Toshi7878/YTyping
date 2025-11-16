import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";
import {
  readPreviewYTPlayer,
  resetPreviewVideoInfo,
  setPreviewVideoInfo,
  usePreviewVideoInfoState,
} from "@/lib/atoms/global-atoms";
import { cn } from "@/lib/utils";
import type { MapListItem } from "@/server/api/routers/map-list";

const mapLeftThumbnailVariants = cva("relative aspect-video", {
  variants: {
    size: {
      home: "w-[160px] sm:w-[220px]",
      timeline: "w-[120px]",
      activeUser: "w-[120px]",
      notification: "w-[160px]",
    },
  },
});

interface MapLeftThumbnailPreviewCoverProps {
  src?: string;
  alt?: string;
  media?: MapListItem["media"];
  size: VariantProps<typeof mapLeftThumbnailVariants>["size"];
  className?: string;
  imageClassName?: string;
  priority: boolean; // 優先読み込みフラグ（初期表示される画像用）
}

const PREVIEW_DISABLE_PATHNAMES = ["type", "edit"];

export const MapLeftThumbnail = (props: MapLeftThumbnailPreviewCoverProps & React.HTMLAttributes<HTMLDivElement>) => {
  const { alt = "", media, size, className, imageClassName, priority = false, ...rest } = props;

  const [shouldLoad, setShouldLoad] = useState(priority); // priorityがtrueなら初期状態で読み込む
  const containerRef = useRef<HTMLDivElement>(null);

  const src = `https://i.ytimg.com/vi/${media?.videoId}/mqdefault.jpg`;
  const pathname = usePathname();
  const pathSegment = pathname.split("/")[1];

  useEffect(() => {
    // priorityがtrueの場合は既に読み込み開始しているのでObserver不要
    if (priority) return;

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.unobserve(entry.target); // 一度読み込んだらobserve解除
          }
        });
      },
      {
        rootMargin: "200px", // 画面に入る200px前から読み込み開始
        threshold: 0.01, // 1%でも見えたら読み込み開始
      },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  return (
    <div ref={containerRef} className={cn("group relative my-auto select-none", className)} {...rest}>
      {media ? (
        <>
          <div className={mapLeftThumbnailVariants({ size })}>
            {shouldLoad ? (
              <Image
                unoptimized
                loading={priority ? "eager" : "lazy"}
                alt={alt}
                src={src}
                fill
                className={cn("rounded-md", imageClassName)}
              />
            ) : (
              // プレースホルダー（スケルトン）
              <div className={cn("rounded-md bg-muted animate-pulse", imageClassName)} />
            )}
          </div>
          {!PREVIEW_DISABLE_PATHNAMES.includes(pathSegment ?? "") && shouldLoad && (
            <ThumbnailPreviewCover {...media} className={imageClassName} />
          )}
        </>
      ) : (
        <div className={cn(mapLeftThumbnailVariants({ size }))}>
          <div className="flex-start flex h-full w-full items-center justify-center">{alt}</div>
        </div>
      )}
    </div>
  );
};

const ThumbnailPreviewCover = (props: MapListItem["media"] & { className?: string }) => {
  const { videoId: mapVideoId, previewTime: mapPreviewTime, previewSpeed: mapPreviewSpeed } = props;
  const { videoId } = usePreviewVideoInfoState();
  const [isTouchMove, setIsTouchMove] = useState(false);

  const previewYouTube = () => {
    if (videoId !== mapVideoId) {
      if (!readPreviewYTPlayer()) return;
      setPreviewVideoInfo({
        videoId: mapVideoId,
        previewTime: mapPreviewTime,
        previewSpeed: mapPreviewSpeed ?? 1,
      });
    } else {
      resetPreviewVideoInfo();
    }
  };

  const handleTouchMove = () => {
    setIsTouchMove(true);
  };

  const handleTouchEnd = () => {
    if (!isTouchMove) {
      if (videoId !== mapVideoId) {
        previewYouTube();
      }
    }
    setIsTouchMove(false);
  };

  const isActive = videoId === mapVideoId;

  return (
    <div
      className={cn(
        "absolute inset-0 flex cursor-pointer items-center justify-center rounded-lg border-none",
        isActive ? "bg-black/50 opacity-100" : "bg-black/30 opacity-0 group-hover:opacity-100",
        props.className,
      )}
      onClick={previewYouTube}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isActive ? <FaPause color="white" size={35} /> : <FaPlay color="white" size={35} />}
    </div>
  );
};
