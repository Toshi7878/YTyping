import type { IntersectionOptions } from "react-intersection-observer";
import { useInView } from "react-intersection-observer";

export const useInViewRender = (options: IntersectionOptions = {}) => {
  const { initialInView = false, rootMargin = "400px", ...rest } = options;

  const { ref, inView } = useInView({ triggerOnce: true, rootMargin, initialInView, ...rest });

  return { ref, shouldRender: inView };
};
