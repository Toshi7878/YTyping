import { ActiveUserStatus, YTPlayer } from "@/types/global-types";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { atomWithReset, atomWithStorage, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";

const volumeAtom = atomWithStorage("volume", 30, undefined, {
  getOnInit: false,
});

export const useVolumeState = () => useAtomValue(volumeAtom);
export const useSetVolume = () => useSetAtom(volumeAtom);
export const useVolumeStateRef = () => {
  return useAtomCallback(useCallback((get) => get(volumeAtom), []));
};

const previewVideoAtom = atomWithReset<{
  videoId: string | null;
  previewTime: string | null;
  previewSpeed: string | null;
  player: YTPlayer | null;
}>({ videoId: null, previewTime: null, previewSpeed: null, player: null });
const previewPlayerFocusAtom = focusAtom(previewVideoAtom, (optic) => optic.prop("player"));

export const usePreviewVideoState = () => useAtomValue(previewVideoAtom);
export const useSetPreviewVideo = () => useSetAtom(previewVideoAtom);
export const usePreviewPlayerState = () => useAtomValue(previewPlayerFocusAtom);
export const useSetPreviewPlayer = () => useSetAtom(previewPlayerFocusAtom);

const onlineUsersAtom = atom<ActiveUserStatus[]>([]);

export const useOnlineUsersState = () => useAtomValue(onlineUsersAtom);
export const useSetOnlineUsers = () => useSetAtom(onlineUsersAtom);
