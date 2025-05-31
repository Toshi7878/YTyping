"use client";
import { useEffect } from "react";

interface TypeLayoutProps {
  children: React.ReactNode;
}

export default function TypeLayout({ children }: TypeLayoutProps) {
  useEffect(() => {
    // typeページでは画面のスクロールを無効にする
    const htmlElement = document.documentElement;
    const bodyElement = document.body;

    htmlElement.style.overflow = "hidden";
    bodyElement.style.overflow = "hidden";

    // 初期位置を上部に設定
    window.scrollTo({ top: 0, left: 0 });

    return () => {
      // cleanup時に元に戻す
      htmlElement.style.overflow = "";
      bodyElement.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-screen h-screen overflow-hidden flex justify-center items-start z-[1]">
      <div
        className="w-full h-full overflow-auto flex justify-center items-start pt-16 md:pt-16 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
        style={{
          paddingTop: "4rem",
        }}
      >
        {children}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media (max-width: 768px) {
            .type-layout-container .type-content-wrapper {
              padding-top: 3rem !important;
              align-items: center !important;
            }
          }

          @media (max-width: 480px) {
            .type-layout-container .type-content-wrapper {
              padding-top: 2rem !important;
              padding-left: 0.5rem !important;
              padding-right: 0.5rem !important;
            }
          }
        `,
        }}
      />
    </div>
  );
}
