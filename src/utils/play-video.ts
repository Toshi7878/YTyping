import type { VIDEO_PLATFORM_TYPES } from "@/server/drizzle/schema";
import { buildTikTokVideoUrl, parseTikTokUrl } from "./tiktok";
import { buildYouTubeWatchUrl, parseYouTubeUrl } from "./youtube";

export type PlayVideoPlatform = (typeof VIDEO_PLATFORM_TYPES)[number];

// Recordなので、プラットフォームを追加したときの定義漏れは型エラーになる
export const PLAY_VIDEO_PLATFORM_LABELS: Record<PlayVideoPlatform, string> = {
  YOUTUBE: "YouTube",
  TIKTOK: "TikTok",
};

/**
 * プレイ動画のURLからプラットフォームと動画IDを判定する。対応していないURLなら undefined。
 * 動画IDの形式: YouTube は動画ID、TikTok は "ユーザー名/動画ID"
 */
export const parsePlayVideoUrl = (input: string): { platform: PlayVideoPlatform; videoId: string } | undefined => {
  const youtubeId = parseYouTubeUrl(input);
  if (youtubeId) return { platform: "YOUTUBE", videoId: youtubeId };

  const tiktokId = parseTikTokUrl(input);
  if (tiktokId) return { platform: "TIKTOK", videoId: tiktokId };

  return;
};

export const buildPlayVideoUrl = (platform: PlayVideoPlatform, videoId: string) => {
  switch (platform) {
    case "YOUTUBE":
      return buildYouTubeWatchUrl(videoId);
    case "TIKTOK":
      return buildTikTokVideoUrl(videoId);
  }
};
