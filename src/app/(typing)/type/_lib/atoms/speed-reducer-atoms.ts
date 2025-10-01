import { useAtomValue, useSetAtom } from "jotai";
import { atomWithReset, RESET, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import type { YouTubeSpeed } from "@/types/types";
import { playerAtom } from "./read-atoms";
import { sceneAtom } from "./state-atoms";
import { getTypeAtomStore } from "./store";

const store = getTypeAtomStore();

type SpeedActionType = "up" | "down" | "set" | "reset" | "toggle";

export const speedBaseAtom = atomWithReset({
  minPlaySpeed: 1,
  playSpeed: 1,
});

export const useSetSpeed = () => useSetAtom(speedBaseAtom, { store });

export const usePlaySpeedState = () => useAtomValue(speedBaseAtom, { store });
export const useReadPlaySpeed = () => {
  return useAtomCallback(
    useCallback((get) => get(speedBaseAtom), []),
    { store },
  );
};

export const usePlaySpeedReducer =
  () =>
  ({ type, payload: value }: { type: SpeedActionType; payload?: YouTubeSpeed }) => {
    const player = store.get(playerAtom);
    const { minPlaySpeed } = store.get(speedBaseAtom);
    const playSpeed = player?.getPlaybackRate();
    if (!playSpeed) return;
    const scene = store.get(sceneAtom);
    const isUpdateMinSpeed = scene !== "play";

    switch (type) {
      case "up":
        if (playSpeed < 2) {
          player?.setPlaybackRate(playSpeed + 0.25);

          store.set(speedBaseAtom, (prev) => ({
            ...prev,
            minPlaySpeed: isUpdateMinSpeed ? minPlaySpeed + 0.25 : minPlaySpeed,
          }));
        }
        break;
      case "down":
        if (playSpeed > 0.25) {
          player?.setPlaybackRate(playSpeed - 0.25);

          store.set(speedBaseAtom, (prev) => ({
            ...prev,
            minPlaySpeed: isUpdateMinSpeed ? minPlaySpeed - 0.25 : minPlaySpeed,
          }));
        }
        break;
      case "set":
        if (value !== undefined) {
          player?.setPlaybackRate(value);

          store.set(speedBaseAtom, (prev) => ({
            ...prev,
            minPlaySpeed: value,
          }));
        }
        break;
      case "reset":
        player?.setPlaybackRate(1);
        store.set(speedBaseAtom, RESET);
        break;
      case "toggle":
        player?.setPlaybackRate(playSpeed + 0.25 <= 2 ? playSpeed + 0.25 : minPlaySpeed);
        break;
    }
  };
