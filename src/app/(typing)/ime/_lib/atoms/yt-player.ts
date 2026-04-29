import { useAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import { store } from "../../_feature/provider";

const YTPlayerAtom = atomWithReset<YT.Player | null>(null);
export const useYTPlayer = () => useAtomValue(YTPlayerAtom, { store });
export const setYTPlayer = (newYTPlayer: YT.Player) => store.set(YTPlayerAtom, newYTPlayer);
export const resetYTPlayer = () => store.set(YTPlayerAtom, RESET);
export const playYTPlayer = () => store.get(YTPlayerAtom)?.playVideo();
export const seekYTPlayer = (seconds: number) => store.get(YTPlayerAtom)?.seekTo(seconds, true);
export const stopYTPlayer = () => store.get(YTPlayerAtom)?.stopVideo();
export const getYTCurrentTime = () => store.get(YTPlayerAtom)?.getCurrentTime();
