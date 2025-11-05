import { atom, getDefaultStore, useAtomValue } from "jotai";
import type { UAParser } from "ua-parser-js";

const store = getDefaultStore();

export const userAgentAtom = atom<UAParser | null>(null);
export const useBrowserTypeState = () => {
  const userAgent = useAtomValue(userAgentAtom, { store });
  return userAgent?.getBrowser().name;
};
export const useIsMobileDeviceState = () => {
  const userAgent = useAtomValue(userAgentAtom, { store });
  return userAgent?.getDevice().type === "mobile";
};
export const readIsMobileDevice = () => {
  const userAgent = store.get(userAgentAtom);
  return userAgent?.getDevice().type === "mobile";
};
export const readIsDesktopDevice = () => {
  const userAgent = store.get(userAgentAtom);
  return userAgent?.getDevice().type === "desktop";
};
