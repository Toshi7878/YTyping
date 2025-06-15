export const getThumbnailQuality = (videoId: string) => {
  const img = new window.Image();
  img.src = `https://i.ytimg.com/vi_webp/${videoId}/maxresdefault.webp`;
  return new Promise((resolve) => {
    img.onload = () => {
      if (img.width !== 120) {
        resolve("maxresdefault");
      } else {
        resolve("mqdefault");
      }
    };
    img.onerror = () => {
      console.error("画像の読み込みに失敗しました");
      resolve("mqdefault");
    };
  });
};
