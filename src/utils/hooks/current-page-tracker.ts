import { useCallback, useEffect, useRef, useState } from "react";

type UseCurrentPageTrackerOptions = {
  /**
   * 画面中央付近に「ページ先頭のsentinel」が入った時を現在ページとして扱うための設定。
   * 上下の%は viewport に対する rootMargin として使われる。
   */
  rootMargin?: string;
  threshold?: number | number[];
  /**
   * 検索条件が変わった等でページ番号をリセットしたい場合のキー。
   * 変更されると currentPage を 1 に戻し、観測対象をクリアする。
   */
  resetKey?: unknown;
};

export const useCurrentPageTracker = ({
  rootMargin = "-45% 0px -50% 0px",
  threshold = 0,
  resetKey,
}: UseCurrentPageTrackerOptions = {}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const currentPageRef = useRef(1);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const pageIndexByElementRef = useRef(new Map<Element, number>());

  const thresholdKey = Array.isArray(threshold) ? threshold.join(",") : String(threshold);

  useEffect(() => {
    currentPageRef.current = 1;
    setCurrentPage(1);
    pageIndexByElementRef.current.clear();
    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const rootBounds = entries[0]?.rootBounds;
        const viewportCenter = rootBounds ? rootBounds.top + rootBounds.height / 2 : window.innerHeight / 2;

        let best:
          | {
              pageIndex: number;
              score: number;
            }
          | undefined;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const pageIndex = pageIndexByElementRef.current.get(entry.target);
          if (pageIndex === undefined) continue;

          const entryCenter = (entry.boundingClientRect.top + entry.boundingClientRect.bottom) / 2;
          const score = Math.abs(entryCenter - viewportCenter);

          if (!best || score < best.score) {
            best = { pageIndex, score };
          }
        }

        if (!best) return;

        const nextPage = best.pageIndex + 1;
        if (nextPage === currentPageRef.current) return;
        currentPageRef.current = nextPage;
        setCurrentPage(nextPage);
      },
      { rootMargin, threshold },
    );

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      pageIndexByElementRef.current.clear();
    };
  }, [rootMargin, thresholdKey, resetKey]);

  const getSentinelRef = useCallback((pageIndex: number) => {
    let prevEl: Element | null = null;

    return (el: Element | null) => {
      const observer = observerRef.current;

      if (prevEl && observer) {
        observer.unobserve(prevEl);
      }
      if (prevEl) {
        pageIndexByElementRef.current.delete(prevEl);
      }

      prevEl = el;
      if (!el || !observer) return;

      pageIndexByElementRef.current.set(el, pageIndex);
      observer.observe(el);
    };
  }, []);

  return { currentPage, getSentinelRef };
};

