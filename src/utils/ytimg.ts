export const buildYouTubeThumbnailUrl = (videoId: string, quality: "mqdefault" | "maxresdefault") => {
  switch (quality) {
    case "mqdefault":
      return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
    case "maxresdefault":
      return `https://i.ytimg.com/vi_webp/${videoId}/maxresdefault.webp`;
  }
};
