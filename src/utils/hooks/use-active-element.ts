import { useEffect, useState } from "react";

export const useActiveElement = () => {
  const [activeElement, setActiveElement] = useState<Element | null>(
    typeof document !== "undefined" ? document.activeElement : null
  );

  useEffect(() => {
    const updateActiveElement = () => {
      setActiveElement(document.activeElement);
    };

    // キャプチャフェーズでリスナーを登録（全要素のフォーカス変更を確実に捕捉）
    document.addEventListener("focusin", updateActiveElement, true);
    document.addEventListener("focusout", updateActiveElement, true);

    return () => {
      document.removeEventListener("focusin", updateActiveElement, true);
      document.removeEventListener("focusout", updateActiveElement, true);
    };
  }, []);

  return activeElement;
};

