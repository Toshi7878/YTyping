import { UAParser } from "ua-parser-js";

export const useUserAgent = () => {
  const uaParser = UAParser(navigator.userAgent);
  const isMobile = uaParser.device.is("mobile");

  return { ...uaParser, isMobile };
};
