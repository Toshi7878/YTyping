import useBreakpoint_ from "use-breakpoint";

const BREAKPOINTS = { mobile: 0, tablet: 768, desktop: 1024 };

export const useBreakPoint = () => {
  const { breakpoint } = useBreakpoint_(BREAKPOINTS, "mobile");

  const isSmScreen = breakpoint === "mobile";
  const isMdScreen = breakpoint === "tablet" || breakpoint === "desktop";
  const isLgScreen = breakpoint === "desktop";

  return {
    breakpoint,
    isSmScreen,
    isMdScreen,
    isLgScreen,
  };
};
