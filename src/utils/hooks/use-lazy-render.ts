import { useEffect, useRef, useState } from "react";
import type { IntersectionOptions } from "react-intersection-observer";

interface UseLazyRenderOptions extends IntersectionOptions {
  priority?: boolean;
}

export const useLazyRender = (options: UseLazyRenderOptions = {}) => {
  const { priority = false, rootMargin = "400px" } = options;

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
      { rootMargin },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [priority, rootMargin]);

  return { ref, shouldRender };
};
