import { useEffect, useState } from "react";

export const CONTENT_WIDTH = 1500;
const CONTENT_HEIGHT = 900;

// ブレークポイント定義
const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1440,
} as const;

const useWindowScale = () => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function handleResize() {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let targetScale = 1;

      // モバイル（480px未満）
      if (windowWidth < BREAKPOINTS.mobile) {
        targetScale = Math.min(windowWidth / 480, windowHeight / 800) * 0.65;
      }
      // タブレット（480px以上768px未満）
      else if (windowWidth < BREAKPOINTS.tablet) {
        targetScale = Math.min(windowWidth / 768, windowHeight / 900) * 0.75;
      }
      // デスクトップ（768px以上1024px未満）
      else if (windowWidth < BREAKPOINTS.desktop) {
        targetScale = Math.min(windowWidth / 1024, windowHeight / 1000) * 0.85;
      }
      // 大画面デスクトップ（1024px以上1440px未満）
      else if (windowWidth < BREAKPOINTS.largeDesktop) {
        targetScale = Math.min(windowWidth / 1440, windowHeight / 1000) * 0.95;
      }
      // 非常に大きい画面（1440px以上）
      else {
        const scaleX = windowWidth / CONTENT_WIDTH;
        const scaleY = windowHeight / CONTENT_HEIGHT;
        targetScale = Math.min(scaleX, scaleY, 1.2); // 最大120%まで
      }

      // 最小スケールを0.3、最大スケールを1.5に制限
      targetScale = Math.max(0.3, Math.min(1.5, targetScale));

      setScale(targetScale);
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
