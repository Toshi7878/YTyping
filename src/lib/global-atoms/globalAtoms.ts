import { RouterOutPuts } from "@/server/api/trpc";
import { ActiveUserStatus, YTPlayer } from "@/types/global-types";
import { atom, createStore, useAtomValue, useSetAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { atomWithReset, atomWithStorage, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
const globalAtomStore = createStore();
export const getGlobalAtomStore = () => globalAtomStore;

const getInitialTheme = (): "light" | "dark" => {
  // SSRとCSRで一貫性を保つため、サーバーサイドでも一律darkを返す
  return "dark";
};

const themeAtom = atom<"light" | "dark">(getInitialTheme());

const volumeAtom = atomWithStorage("volume", 30, undefined, {
  getOnInit: false,
});

export const useVolumeState = () => useAtomValue(volumeAtom, { store: globalAtomStore });
export const useSetVolume = () => useSetAtom(volumeAtom, { store: globalAtomStore });
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
export const useSetPreviewVideo = () => useSetAtom(previewVideoAtom, { store: globalAtomStore });
export const usePreviewPlayerState = () => useAtomValue(previewPlayerFocusAtom, { store: globalAtomStore });
export const useSetPreviewPlayer = () => useSetAtom(previewPlayerFocusAtom, { store: globalAtomStore });

const onlineUsersAtom = atom<ActiveUserStatus[]>([]);

export const useOnlineUsersAtom = () => useAtomValue(onlineUsersAtom, { store: globalAtomStore });
export const useSetOnlineUsersAtom = () => useSetAtom(onlineUsersAtom, { store: globalAtomStore });

export const userOptionsAtom = atom<NonNullable<RouterOutPuts["userOption"]["getUserOptions"]>>({
  custom_user_active_state: "ONLINE" as const,
  hide_user_stats: false,
});

export const useUserOptionsState = () => useAtomValue(userOptionsAtom, { store: globalAtomStore });
export const useSetUserOptions = () => useSetAtom(userOptionsAtom, { store: globalAtomStore });
