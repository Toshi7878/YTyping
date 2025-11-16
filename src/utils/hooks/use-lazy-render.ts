import { useEffect, useRef, useState } from "react";

interface UseLazyRenderOptions {
  priority?: boolean;
  rootMargin?: string;
  threshold?: number;
}

/**
 * Intersection Observerを使用して遅延レンダリングを実現するカスタムフック
 * @param options - 優先読み込みフラグとIntersection Observerのオプション
 * @returns ref - 監視対象の要素に割り当てるref, shouldRender - レンダリングすべきかどうかのフラグ
 */
export const useLazyRender = (options: UseLazyRenderOptions = {}) => {
  const { priority = false, rootMargin = "300px", threshold = 0 } = options;

  const [shouldRender, setShouldRender] = useState(priority);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return;

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldRender(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin,
        threshold,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [priority, rootMargin, threshold]);

  return { ref, shouldRender };
};
