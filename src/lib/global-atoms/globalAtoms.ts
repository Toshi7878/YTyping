import { RouterOutPuts } from "@/server/api/trpc";
import { ActiveUserStatus, YTPlayer } from "@/types/global-types";
import { atom, createStore, useAtomValue, useSetAtom } from "jotai";
import { focusAtom } from "jotai-optics";
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

const themeAtom = atom<"light" | "dark">(getInitialTheme());

const volumeAtom = atomWithStorage("volume", 30, undefined, {
  getOnInit: false,
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
  player: YTPlayer | null;
}>({ videoId: null, previewTime: null, previewSpeed: null, player: null });
const previewPlayerFocusAtom = focusAtom(previewVideoAtom, (optic) => optic.prop("player"));

export const usePreviewVideoState = () => useAtomValue(previewVideoAtom, { store: globalAtomStore });
export const useSetPreviewVideoState = () => useSetAtom(previewVideoAtom, { store: globalAtomStore });
export const usePreviewPlayerState = () => useAtomValue(previewPlayerFocusAtom, { store: globalAtomStore });
export const useSetPreviewPlayerState = () => useSetAtom(previewPlayerFocusAtom, { store: globalAtomStore });

const onlineUsersAtom = atom<ActiveUserStatus[]>([]);

export const useOnlineUsersAtom = () => useAtomValue(onlineUsersAtom, { store: globalAtomStore });
export const useSetOnlineUsersAtom = () => useSetAtom(onlineUsersAtom, { store: globalAtomStore });

export const userOptionsAtom = atom<NonNullable<RouterOutPuts["userOption"]["getUserOptions"]>>({
  custom_user_active_state: "ONLINE" as const,
  hide_user_stats: false,
});

export const useUserOptionsState = () => useAtomValue(userOptionsAtom, { store: globalAtomStore });
export const useSetUserOptionsState = () => useSetAtom(userOptionsAtom, { store: globalAtomStore });
