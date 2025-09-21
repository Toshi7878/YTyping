import type { YouTubeSpeed } from "@/types/global-types";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithReset, RESET, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { playerAtom } from "./refAtoms";
import { notifyAtom, sceneAtom, sceneGroupAtom } from "./stateAtoms";
import { getTypeAtomStore } from "./store";

const store = getTypeAtomStore();

type SpeedActionType = "up" | "down" | "set" | "reset" | "toggle";

export const speedBaseAtom = atomWithReset({
  minPlaySpeed: 1,
  playSpeed: 1,
});

store.sub(speedBaseAtom, () => {
  const sceneGroup = store.get(sceneGroupAtom);
  const { playSpeed } = store.get(speedBaseAtom);
  const isPlaying = sceneGroup === "Playing";
  const player = store.get(playerAtom);
  if (!player) return;

  if (isPlaying) {
    player.setPlaybackRate(playSpeed);
    store.set(notifyAtom, Symbol(`${playSpeed.toFixed(2)}x`));
  }
});

const speedReducerAtom = atom(
  null,
  (get, set, { type, payload: value }: { type: SpeedActionType; payload?: YouTubeSpeed }) => {
    const { playSpeed, minPlaySpeed } = get(speedBaseAtom);
    const scene = get(sceneAtom);
    const isUpdateDefaultSp = scene !== "play";

    switch (type) {
      case "up":
        if (playSpeed < 2) {
          set(speedBaseAtom, {
            minPlaySpeed: isUpdateDefaultSp ? minPlaySpeed + 0.25 : minPlaySpeed,
            playSpeed: playSpeed + 0.25,
          });
        }
        break;
      case "down":
        if (playSpeed > 0.25) {
          set(speedBaseAtom, {
            minPlaySpeed: isUpdateDefaultSp ? minPlaySpeed - 0.25 : minPlaySpeed,
            playSpeed: playSpeed - 0.25,
          });
        }
        break;
      case "set":
        if (value !== undefined) {
          set(speedBaseAtom, () => {
            return {
              minPlaySpeed: value,
              playSpeed: value,
            };
          });
        }
        break;
      case "reset":
        set(speedBaseAtom, RESET);
        break;
      case "toggle":
        const newPlaySpeed = playSpeed + 0.25 <= 2 ? playSpeed + 0.25 : minPlaySpeed;
        set(speedBaseAtom, {
          playSpeed: newPlaySpeed,
          minPlaySpeed,
        });
        break;
    }
  },
);

export const usePlaySpeedState = () => useAtomValue(speedBaseAtom, { store });
export const usePlaySpeedReducer = () => useSetAtom(speedReducerAtom, { store });
export const useReadPlaySpeed = () => {
  return useAtomCallback(
    useCallback((get) => get(speedBaseAtom), []),
    { store },
  );
};
