import type { IntersectionOptions } from "react-intersection-observer";
import { useInView } from "react-intersection-observer";

interface UseLazyRenderOptions extends IntersectionOptions {
  priority?: boolean;
}

export const useLazyRender = (options: UseLazyRenderOptions = {}) => {
  const { priority = false, rootMargin = "400px", ...rest } = options;

  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin,
    initialInView: priority,
    skip: priority,
    ...rest,
  });

  return { ref, shouldRender: inView };
};
