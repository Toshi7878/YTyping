import { type ExtractAtomValue, useAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import type { YouTubeSpeed } from "@/utils/types";
import { readScene } from "./state";
import { getTypeAtomStore } from "./store";
import { getYTPlaybackRate, setYTPlaybackRate } from "./yt-player";

type Updater<T> = T | ((prev: T) => T);

const store = getTypeAtomStore();

type SpeedActionType = "up" | "down" | "set" | "reset" | "toggle";

export const speedBaseAtom = atomWithReset({
  minPlaySpeed: 1,
  playSpeed: 1,
});

export const usePlaySpeedState = () => useAtomValue(speedBaseAtom, { store });
export const readPlaySpeed = () => store.get(speedBaseAtom);
export const setSpeed = (update: Updater<ExtractAtomValue<typeof speedBaseAtom>>) => {
  store.set(speedBaseAtom, update);
};
export const resetSpeed = () => store.set(speedBaseAtom, RESET);

export const handlePlaySpeedAction = ({ type, payload: value }: { type: SpeedActionType; payload?: YouTubeSpeed }) => {
  const { minPlaySpeed } = store.get(speedBaseAtom);
  const playSpeed = getYTPlaybackRate();
  if (!playSpeed) return;
  const scene = readScene();
  const isUpdateMinSpeed = scene !== "play";

  switch (type) {
    case "up":
      if (playSpeed < 2) {
        setYTPlaybackRate(playSpeed + 0.25);

        store.set(speedBaseAtom, (prev) => ({
          ...prev,
          minPlaySpeed: isUpdateMinSpeed ? minPlaySpeed + 0.25 : minPlaySpeed,
        }));
      }
      break;
    case "down":
      if (playSpeed > 0.25) {
        setYTPlaybackRate(playSpeed - 0.25);

        store.set(speedBaseAtom, (prev) => ({
          ...prev,
          minPlaySpeed: isUpdateMinSpeed ? minPlaySpeed - 0.25 : minPlaySpeed,
        }));
      }
      break;
    case "set":
      if (value !== undefined) {
        setYTPlaybackRate(value);

        store.set(speedBaseAtom, (prev) => ({
          ...prev,
          minPlaySpeed: value,
        }));
      }
      break;
    case "reset":
      setYTPlaybackRate(1);
      store.set(speedBaseAtom, RESET);
      break;
    case "toggle":
      setYTPlaybackRate(playSpeed + 0.25 <= 2 ? playSpeed + 0.25 : minPlaySpeed);
      break;
  }
};
