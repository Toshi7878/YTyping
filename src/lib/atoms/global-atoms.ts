import { atom, type ExtractAtomValue, getDefaultStore, useAtomValue, useSetAtom } from "jotai";
import { atomWithReset, atomWithStorage, RESET } from "jotai/utils";
import { focusAtom } from "jotai-optics";
import type { ReactNode } from "react";
import { useCallback } from "react";
import type { Updater } from "@/utils/types";

const store = getDefaultStore();

const volumeAtom = atomWithStorage("volume", 30, undefined, {
  getOnInit: false,
});

export const useVolumeState = () => useAtomValue(volumeAtom, { store });
export const useSetVolume = () => useSetAtom(volumeAtom, { store });
export const readVolume = () => store.get(volumeAtom);

const previewVideoAtom = atomWithReset<{
  videoId: string | null;
  previewTime: number | null;
  previewSpeed: number | null;
  player: YT.Player | null;
}>({ videoId: null, previewTime: null, previewSpeed: null, player: null });

const previewPlayerFocusAtom = focusAtom(previewVideoAtom, (optic) => optic.prop("player"));

export const usePreviewVideoState = () => useAtomValue(previewVideoAtom, { store });

export const setPreviewVideo = (update: Updater<ExtractAtomValue<typeof previewVideoAtom>>) =>
  store.set(previewVideoAtom, update);
export const resetPreviewVideo = () => store.set(previewVideoAtom, RESET);
export const usePreviewPlayerState = () => useAtomValue(previewPlayerFocusAtom, { store });
export const useSetPreviewPlayer = () => useSetAtom(previewPlayerFocusAtom, { store });

export interface ActiveUserStatus {
  id: number;
  name: string;
  onlineAt: Date;
  state: "type" | "edit" | "idle" | "askMe";
  mapId: number | null;
}

const onlineUsersAtom = atom<ActiveUserStatus[]>([]);

export const useOnlineUsersState = () => useAtomValue(onlineUsersAtom, { store });
export const useSetOnlineUsers = () => useSetAtom(onlineUsersAtom, { store });

interface LoadingState {
  isLoading: boolean;
  message?: ReactNode;
  hideSpinner?: boolean;
}

const globalLoadingAtom = atomWithReset<LoadingState>({
  isLoading: false,
  message: undefined,
  hideSpinner: false,
});

export const useGlobalLoadingState = () => useAtomValue(globalLoadingAtom, { store });

export const useGlobalLoadingOverlay = () => {
  const setLoadingState = useSetAtom(globalLoadingAtom, { store });

  const showLoading = useCallback(({ message, hideSpinner }: { message?: ReactNode; hideSpinner?: boolean } = {}) => {
    setLoadingState({ isLoading: true, message, hideSpinner });
  }, []);

  const hideLoading = useCallback(() => {
    setLoadingState(RESET);
  }, []);

  return { showLoading, hideLoading };
};
