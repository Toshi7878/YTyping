import useBreakpoint from "use-breakpoint";

const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1280,
};

const useBreakPoint = (defaultBreakpoint?: keyof typeof BREAKPOINTS) => {
  const breakPoint = useBreakpoint(BREAKPOINTS, defaultBreakpoint);
  return breakPoint;
};

export default useBreakPoint;
