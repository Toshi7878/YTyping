import { RouterOutPuts } from "@/server/api/trpc";
import { ActiveUserStatus } from "@/types/global-types";
import { atom, createStore, useAtomValue, useSetAtom } from "jotai";
import { atomWithReset, atomWithStorage, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
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

const volumeAtom = atomWithStorage<number>("volume", 30, undefined, {
  getOnInit: true,
});

export const useVolumeState = () => useAtomValue(volumeAtom, { store: globalAtomStore });
export const useSetVolumeState = () => useSetAtom(volumeAtom, { store: globalAtomStore });
export const useVolumeStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(volumeAtom), []),
    { store: globalAtomStore }
  );
};

const previewVideoAtom = atomWithReset<{
  videoId: string | null;
  previewTime: string | null;
  previewSpeed: string | null;
}>({ videoId: null, previewTime: null, previewSpeed: null });

export const usePreviewVideoState = () => useAtomValue(previewVideoAtom, { store: globalAtomStore });
export const useSetPreviewVideoState = () => useSetAtom(previewVideoAtom, { store: globalAtomStore });

const onlineUsersAtom = atom<ActiveUserStatus[]>([]);

export const useOnlineUsersAtom = () => useAtomValue(onlineUsersAtom, { store: globalAtomStore });
export const useSetOnlineUsersAtom = () => useSetAtom(onlineUsersAtom, { store: globalAtomStore });

export const userOptionsAtom = atom<RouterOutPuts["userOption"]["getUserOptions"]>({
  custom_user_active_state: "ONLINE" as const,
});

export const useUserOptionsAtom = () => useAtomValue(userOptionsAtom, { store: globalAtomStore });
export const useSetUserOptionsAtom = () => useSetAtom(userOptionsAtom, { store: globalAtomStore });
