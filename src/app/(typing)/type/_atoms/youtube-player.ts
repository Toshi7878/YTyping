import { useAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import { readIsDesktopDevice } from "@/lib/atoms/user-agent";
import { cycleMediaSpeed, getNextMediaSpeed } from "@/utils/media-speed-change";
import { setMinMediaSpeed } from "./state";
import { getTypeAtomStore } from "./store";

const store = getTypeAtomStore();

const YTPlayerAtom = atomWithReset<YT.Player | null>(null);
export const useYTPlayer = () => useAtomValue(YTPlayerAtom);
export const readYTPlayer = () => store.get(YTPlayerAtom);
export const writeYTPlayer = (newYTPlayer: YT.Player) => store.set(YTPlayerAtom, newYTPlayer);
export const resetYTPlayer = () => store.set(YTPlayerAtom, RESET);
export const playYTPlayer = () => store.get(YTPlayerAtom)?.playVideo();
export const pauseYTPlayer = () => store.get(YTPlayerAtom)?.pauseVideo();
export const seekYTPlayer = (seconds: number) => store.get(YTPlayerAtom)?.seekTo(seconds, true);
export const stopYTPlayer = () => store.get(YTPlayerAtom)?.stopVideo();
export const getYTPlayerState = () => store.get(YTPlayerAtom)?.getPlayerState();
const getYTPlaybackRate = () => store.get(YTPlayerAtom)?.getPlaybackRate();
export const cycleYTPlaybackRate = ({ minSpeed }: { minSpeed: number }) => {
  const currentSpeed = getYTPlaybackRate();
  if (!currentSpeed) return;

  const nextSpeed = cycleMediaSpeed({ current: currentSpeed, min: minSpeed });
  setYTPlaybackRate(nextSpeed);
};
export const stepYTPlaybackRate = (direction: "up" | "down") => {
  const current = getYTPlaybackRate();
  if (current == null) return;

  const next = getNextMediaSpeed({ type: direction, current });

  setYTPlaybackRate(next);
  setMinMediaSpeed(next);
};

export const setYTPlaybackRate = (suggestedRate: number) => store.get(YTPlayerAtom)?.setPlaybackRate(suggestedRate);
export const getYTVideoId = () => store.get(YTPlayerAtom)?.getVideoData().video_id;
export const getYTCurrentTime = () => store.get(YTPlayerAtom)?.getCurrentTime();
export const cueYTVideoById = (videoId: string) => store.get(YTPlayerAtom)?.cueVideoById(videoId);

export const primeYTPlayerForMobilePlayback = () => {
  const isDesktop = readIsDesktopDevice();
  if (!isDesktop) {
    playYTPlayer();
    pauseYTPlayer();
  }
};
