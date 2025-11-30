import { atom, type ExtractAtomValue, getDefaultStore, useAtomValue, useSetAtom } from "jotai";
import { atomWithReset, atomWithStorage, RESET } from "jotai/utils";
import type { ReactNode } from "react";
import { useCallback } from "react";

const store = getDefaultStore();

const volumeAtom = atomWithStorage("volume", 30, undefined, {
  getOnInit: true,
});

export const useVolumeState = () => useAtomValue(volumeAtom, { store });
export const readVolume = () => store.get(volumeAtom);
export const setVolume = (value: number) => store.set(volumeAtom, value);

const previewVideoInfoAtom = atomWithReset<{
  videoId: string | null;
  previewTime: number | null;
  previewSpeed: number | null;
}>({ videoId: null, previewTime: null, previewSpeed: null });
const previewYTPlayerAtom = atomWithReset<YT.Player | null>(null);

// const previewPlayerFocusAtom = focusAtom(previewVideoAtom, (optic) => optic.prop("player"));

export const usePreviewVideoInfoState = () => useAtomValue(previewVideoInfoAtom, { store });
export const readPreviewVideoInfo = () => store.get(previewVideoInfoAtom);
export const setPreviewVideoInfo = (info: ExtractAtomValue<typeof previewVideoInfoAtom>) => {
  store.set(previewVideoInfoAtom, info);

  const { videoId, previewTime } = info;
  if (videoId) {
    const player = readPreviewYTPlayer();
    if (videoId) {
      player?.cueVideoById({ videoId, startSeconds: previewTime ?? 0 });
    }
  }
};
export const resetPreviewVideoInfo = () => {
  store.set(previewVideoInfoAtom, RESET);
  const YTPlayer = readPreviewYTPlayer();
  YTPlayer?.cueVideoById({ videoId: "" });
};

export const usePreviewPlayerState = () => useAtomValue(previewYTPlayerAtom, { store });
export const readPreviewYTPlayer = () => store.get(previewYTPlayerAtom);
export const setPreviewYTPlayer = (newYTPlayer: YT.Player) => store.set(previewYTPlayerAtom, newYTPlayer);
export const resetPreviewYTPlayer = () => store.set(previewYTPlayerAtom, RESET);

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
