"use client";
import { Video } from "lucide-react";
import { TooltipWrapper } from "@/ui/tooltip";
import { cn } from "@/utils/cn";
import { buildPlayVideoUrl, PLAY_VIDEO_PLATFORM_LABELS, type PlayVideoPlatform } from "@/utils/play-video";

export interface PlayVideo {
  platform: PlayVideoPlatform | null;
  videoId: string | null;
}

interface PlayVideoLinkProps {
  playVideo: PlayVideo;
  className?: string;
}

/** 記録に登録されたプレイ動画への外部リンク。登録がなければ何も表示しない */
export const PlayVideoLink = ({ playVideo, className }: PlayVideoLinkProps) => {
  const { platform, videoId } = playVideo;
  if (!platform || !videoId) return null;

  const href = buildPlayVideoUrl(platform, videoId);
  if (!href) return null;

  const label = `${PLAY_VIDEO_PLATFORM_LABELS[platform]}でプレイ動画を見る`;

  return (
    <TooltipWrapper label={label} asChild>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        className={cn("inline-flex items-center text-secondary hover:opacity-70", className)}
      >
        <Video className="size-4" />
      </a>
    </TooltipWrapper>
  );
};
