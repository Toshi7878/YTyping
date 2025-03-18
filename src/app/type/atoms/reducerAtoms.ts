import { YouTubeSpeed } from "@/types";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithReset, RESET, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { getTypeAtomStore, sceneAtom } from "./stateAtoms";

const store = getTypeAtomStore();

const speedBaseAtom = atomWithReset({
  defaultSpeed: 1,
  playSpeed: 1,
});

type SpeedActionType = "up" | "down" | "set" | "reset" | "toggle";
const speedReducerAtom = atom(
  null,
  (get, set, { type, payload: value }: { type: SpeedActionType; payload?: YouTubeSpeed }) => {
    const { playSpeed, defaultSpeed } = get(speedBaseAtom);
    const scene = get(sceneAtom);
    const isUpdateDefaultSp = scene !== "playing";

    switch (type) {
      case "up":
        if (playSpeed < 2) {
          set(speedBaseAtom, {
            defaultSpeed: isUpdateDefaultSp ? defaultSpeed + 0.25 : defaultSpeed,
            playSpeed: playSpeed + 0.25,
          });
        }
        break;
      case "down":
        if (playSpeed > 0.25) {
          set(speedBaseAtom, {
            defaultSpeed: isUpdateDefaultSp ? defaultSpeed - 0.25 : defaultSpeed,
            playSpeed: playSpeed - 0.25,
          });
        }
        break;
      case "set":
        if (value !== undefined) {
          set(speedBaseAtom, {
            defaultSpeed: value,
            playSpeed: value,
          });
        }
        break;
      case "reset":
        set(speedBaseAtom, RESET);
        break;
      case "toggle":
        const newPlaySpeed = playSpeed + 0.25 < 2 ? playSpeed + 0.25 : defaultSpeed;
        set(speedBaseAtom, {
          playSpeed: newPlaySpeed,
          defaultSpeed,
        });
        break;
    }
  }
);

export const usePlaySpeedState = () => useAtomValue(speedBaseAtom, { store });
export const usePlaySpeedReducer = () => useSetAtom(speedReducerAtom, { store });
export const usePlaySpeedStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(speedBaseAtom), []),
    { store }
  );
};
