import { type ExtractAtomValue, useAtomValue, useSetAtom } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import type { YouTubeSpeed } from "@/utils/types";
import { readYTPlayer } from "./read-atoms";
import { readScene } from "./state-atoms";
import { getTypeAtomStore } from "./store";

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
export const useSetSpeed = () => useSetAtom(speedBaseAtom, { store });

export const handlePlaySpeedAction = ({ type, payload: value }: { type: SpeedActionType; payload?: YouTubeSpeed }) => {
  const YTPlayer = readYTPlayer();
  if (!YTPlayer) return;
  const { minPlaySpeed } = store.get(speedBaseAtom);
  const playSpeed = YTPlayer.getPlaybackRate();
  if (!playSpeed) return;
  const scene = readScene();
  const isUpdateMinSpeed = scene !== "play";

  switch (type) {
    case "up":
      if (playSpeed < 2) {
        YTPlayer.setPlaybackRate(playSpeed + 0.25);

        store.set(speedBaseAtom, (prev) => ({
          ...prev,
          minPlaySpeed: isUpdateMinSpeed ? minPlaySpeed + 0.25 : minPlaySpeed,
        }));
      }
      break;
    case "down":
      if (playSpeed > 0.25) {
        YTPlayer.setPlaybackRate(playSpeed - 0.25);

        store.set(speedBaseAtom, (prev) => ({
          ...prev,
          minPlaySpeed: isUpdateMinSpeed ? minPlaySpeed - 0.25 : minPlaySpeed,
        }));
      }
      break;
    case "set":
      if (value !== undefined) {
        YTPlayer.setPlaybackRate(value);

        store.set(speedBaseAtom, (prev) => ({
          ...prev,
          minPlaySpeed: value,
        }));
      }
      break;
    case "reset":
      YTPlayer.setPlaybackRate(1);
      store.set(speedBaseAtom, RESET);
      break;
    case "toggle":
      YTPlayer.setPlaybackRate(playSpeed + 0.25 <= 2 ? playSpeed + 0.25 : minPlaySpeed);
      break;
  }
};
