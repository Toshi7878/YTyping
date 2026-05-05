import { type ExtractAtomValue, getDefaultStore, useAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";

const store = getDefaultStore();

const previewVideoInfoAtom = atomWithReset<{
  videoId: string | null;
  previewTime: number | null;
  previewSpeed: number | null;
}>({ videoId: null, previewTime: null, previewSpeed: null });
const previewYTPlayerAtom = atomWithReset<YT.Player | null>(null);

export const usePreviewVideoInfo = () => useAtomValue(previewVideoInfoAtom, { store });
export const getPreviewVideoInfo = () => store.get(previewVideoInfoAtom);
export const setPreviewVideoInfo = (info: ExtractAtomValue<typeof previewVideoInfoAtom>) => {
  store.set(previewVideoInfoAtom, info);

  const { videoId, previewTime } = info;
  if (videoId) {
    const player = getPreviewYTPlayer();
    if (videoId) {
      player?.cueVideoById({ videoId, startSeconds: previewTime ?? 0 });
    }
  }
};
export const resetPreviewVideoInfo = () => {
  store.set(previewVideoInfoAtom, RESET);
  const YTPlayer = getPreviewYTPlayer();
  YTPlayer?.cueVideoById({ videoId: "" });
};

export const usePreviewYTPlayer = () => useAtomValue(previewYTPlayerAtom, { store });
export const getPreviewYTPlayer = () => store.get(previewYTPlayerAtom);
export const setPreviewYTPlayer = (newYTPlayer: YT.Player) => store.set(previewYTPlayerAtom, newYTPlayer);
export const resetPreviewYTPlayer = () => store.set(previewYTPlayerAtom, RESET);
