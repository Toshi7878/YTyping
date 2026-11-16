const TIKTOK_HOSTS = new Set(["tiktok.com", "www.tiktok.com", "m.tiktok.com"]);
const TIKTOK_VIDEO_PATH_PATTERN = /^\/@([\w.]{1,24})\/video\/(\d{1,20})\/?$/;
const TIKTOK_VIDEO_KEY_PATTERN = /^([\w.]{1,24})\/(\d{1,20})$/;

/**
 * TikTokの動画ページのURL(tiktok.com/@ユーザー名/video/動画ID)から、"ユーザー名/動画ID" を取り出す。
 * 動画のURLの組み立てにユーザー名が必要なため、動画IDと合わせて保持する。
 * 短縮URL(vm.tiktok.com, tiktok.com/t/...)はリダイレクト先を解決できないため非対応
 */
export const parseTikTokUrl = (input: string) => {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return;
  }
  if (!TIKTOK_HOSTS.has(url.hostname)) return;

  const match = url.pathname.match(TIKTOK_VIDEO_PATH_PATTERN);
  return match ? `${match[1]}/${match[2]}` : undefined;
};

/** parseTikTokUrl の戻り値("ユーザー名/動画ID")から動画のURLを組み立てる。不正な値なら undefined */
export const buildTikTokVideoUrl = (videoKey: string) => {
  const match = videoKey.match(TIKTOK_VIDEO_KEY_PATTERN);
  return match ? `https://www.tiktok.com/@${match[1]}/video/${match[2]}` : undefined;
};
