import { ActiveUserStatus, YTPlayer } from "@/types/global-types";
import { atom, getDefaultStore, useAtomValue, useSetAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { atomWithReset, atomWithStorage, RESET, useAtomCallback } from "jotai/utils";
import type { ReactNode } from "react";
import { useCallback } from "react";

const store = getDefaultStore();

const volumeAtom = atomWithStorage("volume", 30, undefined, {
  getOnInit: false,
});

export const useVolumeState = () => useAtomValue(volumeAtom, { store });
export const useSetVolume = () => useSetAtom(volumeAtom, { store });
export const useReadVolume = () =>
  useAtomCallback(
    useCallback((get) => get(volumeAtom), []),
    { store },
  );

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

interface LoadingState {
  isLoading: boolean;
  message?: ReactNode;
  hideSpinner?: boolean;
}

const loadingStateAtom = atomWithReset<LoadingState>({
  isLoading: false,
  message: undefined,
  hideSpinner: false,
});

export const useGlobalLoadingState = () => useAtomValue(loadingStateAtom, { store });

export const useGlobalLoadingOverlay = () => {
  const setLoadingState = useSetAtom(loadingStateAtom, { store });

  const showLoading = useCallback(
    ({ message, hideSpinner }: { message?: ReactNode; hideSpinner?: boolean } = {}) => {
      setLoadingState({ isLoading: true, message, hideSpinner });
    },
    [setLoadingState],
  );

  const hideLoading = useCallback(() => {
    setLoadingState(RESET);
  }, [setLoadingState]);

  return { showLoading, hideLoading };
};
