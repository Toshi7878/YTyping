import { ActiveUserStatus, YTPlayer } from "@/types/global-types";
import { atom, createStore, useAtomValue, useSetAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { atomWithReset, atomWithStorage, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";

const store = createStore();
export const getGlobalStore = () => store;

const volumeAtom = atomWithStorage("volume", 30, undefined, {
  getOnInit: false,
});

export const useVolumeState = () => useAtomValue(volumeAtom, { store });
export const useSetVolume = () => useSetAtom(volumeAtom, { store });
export const useVolumeStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(volumeAtom), []),
    { store },
  );
};

const previewVideoAtom = atomWithReset<{
  videoId: string | null;
  previewTime: string | null;
  previewSpeed: string | null;
  player: YTPlayer | null;
}>({ videoId: null, previewTime: null, previewSpeed: null, player: null });
const previewPlayerFocusAtom = focusAtom(previewVideoAtom, (optic) => optic.prop("player"));

export const usePreviewVideoState = () => useAtomValue(previewVideoAtom, { store });
export const useSetPreviewVideo = () => useSetAtom(previewVideoAtom, { store });
export const usePreviewPlayerState = () => useAtomValue(previewPlayerFocusAtom, { store });
export const useSetPreviewPlayer = () => useSetAtom(previewPlayerFocusAtom, { store });

const onlineUsersAtom = atom<ActiveUserStatus[]>([]);

export const useOnlineUsersState = () => useAtomValue(onlineUsersAtom, { store });
export const useSetOnlineUsers = () => useSetAtom(onlineUsersAtom, { store });
