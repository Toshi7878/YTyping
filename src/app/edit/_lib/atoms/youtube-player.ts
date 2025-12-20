import { useAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import { getEditAtomStore } from "./store";

const store = getEditAtomStore();

const YTPlayerAtom = atomWithReset<YT.Player | null>(null);
export const useYTPlayer = () => useAtomValue(YTPlayerAtom, { store });
export const readYTPlayer = () => store.get(YTPlayerAtom);
export const playYTPlayer = () => store.get(YTPlayerAtom)?.playVideo();
export const pauseYTPlayer = () => store.get(YTPlayerAtom)?.playVideo();
export const seekYTPlayer = (seconds: number) => store.get(YTPlayerAtom)?.seekTo(seconds, true);
export const getYTVideoId = () => store.get(YTPlayerAtom)?.getVideoData().video_id;
export const getYTCurrentTime = () => store.get(YTPlayerAtom)?.getCurrentTime();
export const getYTDuration = () => store.get(YTPlayerAtom)?.getDuration();
export const setYTPlaybackRate = (suggestedRate: number) => store.get(YTPlayerAtom)?.setPlaybackRate(suggestedRate);

export const setYTPlayer = (newYTPlayer: YT.Player) => store.set(YTPlayerAtom, newYTPlayer);
export const resetYTPlayer = () => store.set(YTPlayerAtom, RESET);
