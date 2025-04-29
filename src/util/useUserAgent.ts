"use client";

import { useEffect, useState } from "react";
import { UAParser } from "ua-parser-js";

export const useUserAgent = () => {
  const [userAgent, setUserAgent] = useState<UAParser.IResult | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const parser = new UAParser(navigator.userAgent);
    const result = parser.getResult();
    setUserAgent(result);
    setIsMobile(result.device.type === "mobile");
  }, []);

  return { ...userAgent, isMobile };
};
