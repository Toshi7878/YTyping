export function extractYouTubeId(url: string) {
  // 通常の watch?v=xxx
  const match = url.match(/[?&]v=([^?&]+)/)?.[1];
  if (match?.length === 11) {
    return match;
  }

  // 短縮 URL (youtu.be/xxx)
  const shortUrlMatch = url.match(/youtu\.be\/([^?&]+)/)?.[1];
  if (shortUrlMatch?.length === 11) {
    return shortUrlMatch;
  }

  // Shorts URL (youtube.com/shorts/xxx)
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&]+)/)?.[1];
  if (shortsMatch?.length === 11) {
    return shortsMatch;
  }

  // ライブ配信のアーカイブ (youtube.com/live/xxx) と埋め込み (youtube.com/embed/xxx)
  const liveOrEmbedMatch = url.match(/youtube\.com\/(?:live|embed)\/([^?&/]+)/)?.[1];
  if (liveOrEmbedMatch?.length === 11) {
    return liveOrEmbedMatch;
  }

  return;
}

const YOUTUBE_VIDEO_ID_PATTERN = /^[\w-]{11}$/;
const YOUTUBE_HOSTS = new Set(["youtu.be", "youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com"]);

/** YouTubeの動画URLから動画IDを取り出す。YouTube以外のURLや動画IDとして不正な値なら undefined */
export const parseYouTubeUrl = (input: string) => {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return;
  }
  if (!YOUTUBE_HOSTS.has(url.hostname)) return;

  const videoId = extractYouTubeId(url.href);
  return videoId && YOUTUBE_VIDEO_ID_PATTERN.test(videoId) ? videoId : undefined;
};

export const buildYouTubeWatchUrl = (videoId: string) => `https://www.youtube.com/watch?v=${videoId}`;

export const getYouTubeThumbnailUrl = (videoId: string, quality: "mqdefault" | "maxresdefault") => {
  switch (quality) {
    case "mqdefault":
      return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
    case "maxresdefault":
      return `https://i.ytimg.com/vi_webp/${videoId}/maxresdefault.webp`;
  }
};
