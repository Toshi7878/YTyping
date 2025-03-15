import { useStore } from "jotai";
import { useGameRef, useLineStatusRef, usePlayer } from "../atoms/refAtoms";
import {
  sceneAtom,
  speedAtom,
  useSetPlayingNotifyAtom,
  useSetPlaySpeedAtom,
} from "../atoms/stateAtoms";
import { useGetTime } from "./useGetTime";

export const useVideoSpeedChange = () => {
  const typeAtomStore = useStore();
  const setSpeedData = useSetPlaySpeedAtom();
  const setNotify = useSetPlayingNotifyAtom();
  const { getCurrentLineTime, getCurrentOffsettedYTTime } = useGetTime();

  const { readPlayer } = usePlayer();
  const { writeGameRef } = useGameRef();
  const { readLineStatusRef, writeLineStatusRef } = useLineStatusRef();

  const defaultSpeedChange = (type: "up" | "down" | "set", setSpeed: number = 1) => {
    const defaultSpeed = typeAtomStore.get(speedAtom).defaultSpeed;

    if (type === "up") {
      if (defaultSpeed < 2) {
        setSpeed = defaultSpeed + 0.25;
      } else {
        return;
      }
    } else if (type === "down") {
      if (defaultSpeed > 0.25) {
        setSpeed = defaultSpeed - 0.25;
      } else {
        return;
      }
    }

    setSpeedData({ defaultSpeed: setSpeed, playSpeed: setSpeed });
    readPlayer().setPlaybackRate(setSpeed);

    const scene = typeAtomStore.get(sceneAtom);

    const isPlayed = scene === "playing" || scene === "replay" || scene === "practice";

    if (scene === "ready") {
      writeGameRef({ startPlaySpeed: setSpeed });
    } else if (isPlayed) {
      setNotify(Symbol(`${setSpeed.toFixed(2)}x`));
    }
  };

  const playingSpeedChange = async (type: "set" | "change" = "change", setSpeed: number = 1) => {
    const defaultSpeed = typeAtomStore.get(speedAtom).defaultSpeed;
    const currentSpeed = typeAtomStore.get(speedAtom).playSpeed;

    if (type === "change") {
      setSpeed = currentSpeed + 0.25 <= 2 ? currentSpeed + 0.25 : defaultSpeed;
    } else if (type === "set") {
      //
    }

    setSpeedData({
      defaultSpeed,
      playSpeed: setSpeed,
    });

    readPlayer().setPlaybackRate(setSpeed);

    if (currentSpeed !== setSpeed) {
      setNotify(Symbol(`${setSpeed.toFixed(2)}x`));
    }

    const scene = typeAtomStore.get(sceneAtom);

    if (scene === "playing") {
      const lineTime = getCurrentLineTime(getCurrentOffsettedYTTime());

      writeLineStatusRef({
        typeResult: [
          ...readLineStatusRef().typeResult,
          {
            op: "speedChange",
            t: Math.round(lineTime * 1000) / 1000,
          },
        ],
      });
    }
  };

  return { defaultSpeedChange, playingSpeedChange };
};
