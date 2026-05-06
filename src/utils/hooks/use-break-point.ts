import { useEffect, useState } from "react";

const BREAKPOINTS = { mobile: 0, tablet: 768, desktop: 1024 };
type Breakpoint = keyof typeof BREAKPOINTS;

const getBreakpoint = (width: number): Breakpoint => {
  if (width >= BREAKPOINTS.desktop) return "desktop";
  if (width >= BREAKPOINTS.tablet) return "tablet";
  return "mobile";
};

export const useBreakPoint = () => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("mobile");

  useEffect(() => {
    const updateBreakpoint = () => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    };

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);

    return () => {
      window.removeEventListener("resize", updateBreakpoint);
    };
  }, []);

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
