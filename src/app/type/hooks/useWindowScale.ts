import { useEffect, useState } from "react";

export const CONTENT_WIDTH = 1500;
export const CONTENT_HEIGHT = 1000;

const useWindowScale = () => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function handleResize() {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const scaleX = windowWidth / CONTENT_WIDTH;
      const scaleY = windowHeight / CONTENT_HEIGHT;

      // 横幅と高さの縮小比率の中で最小のものを選ぶ
      const dynamicScale = Math.min(scaleX, scaleY);

      setScale(dynamicScale);
    }

    // 初回ロード時のサイズに基づいてスケーリング
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return { scale };
};

export default useWindowScale;
