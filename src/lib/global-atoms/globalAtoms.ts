import { DEFAULT_VOLUME } from "@/config/consts/globalConst";
import { RouterOutPuts } from "@/server/api/trpc";
import { ActiveUserStatus } from "@/types/global-types";
import { atom, createStore, useAtomValue, useSetAtom } from "jotai";
import { atomWithReset, atomWithStorage } from "jotai/utils";
const globalAtomStore = createStore();
export const getGlobalAtomStore = () => globalAtomStore;

const getInitialTheme = (): "light" | "dark" => {
  if (typeof window !== "undefined") {
    const storedTheme = localStorage.getItem("chakra-ui-color-mode");
    // return storedTheme === "light" || storedTheme === "dark" ? storedTheme : "dark";
  }
  return "dark";
};

export const themeAtom = atom<"light" | "dark">(getInitialTheme());

export const volumeAtom = atomWithStorage<number>("volume", DEFAULT_VOLUME, undefined, {
  getOnInit: true,
});

export const useVolumeAtom = () => {
  return useAtomValue(volumeAtom, { store: globalAtomStore });
};

export const useSetVolumeAtom = () => {
  return useSetAtom(volumeAtom, { store: globalAtomStore });
};

export const previewVideoIdAtom = atom<string | null>(null);

export const usePreviewVideoIdAtom = () => {
  return useAtomValue(previewVideoIdAtom, { store: globalAtomStore });
};
export const useSetPreviewVideoIdAtom = () => {
  return useSetAtom(previewVideoIdAtom, { store: globalAtomStore });
};

const previewTimeAtom = atomWithReset<string | null>(null);

export const usePreviewTimeAtom = () => {
  return useAtomValue(previewTimeAtom, { store: globalAtomStore });
};
export const useSetPreviewTimeAtom = () => {
  return useSetAtom(previewTimeAtom, { store: globalAtomStore });
};

const previewSpeedAtom = atom<number | null>(null);

export const usePreviewSpeedAtom = () => {
  return useAtomValue(previewSpeedAtom, { store: globalAtomStore });
};
export const useSetPreviewSpeedAtom = () => {
  return useSetAtom(previewSpeedAtom, { store: globalAtomStore });
};

const onlineUsersAtom = atom<ActiveUserStatus[]>([]);

export const useOnlineUsersAtom = () => {
  return useAtomValue(onlineUsersAtom, { store: globalAtomStore });
};
export const useSetOnlineUsersAtom = () => {
  return useSetAtom(onlineUsersAtom, { store: globalAtomStore });
};

export const userOptionsAtom = atom<RouterOutPuts["userOption"]["getUserOptions"]>({
  custom_user_active_state: "ONLINE" as const,
});

export const useUserOptionsAtom = () => {
  return useAtomValue(userOptionsAtom, { store: globalAtomStore });
};
export const useSetUserOptionsAtom = () => {
  return useSetAtom(userOptionsAtom, { store: globalAtomStore });
};
