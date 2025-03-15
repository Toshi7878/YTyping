import { useGameUtilsRef, useLineStatusRef, usePlayer } from "../atoms/refAtoms";
import {
  usePlaySpeedStateRef,
  useSceneStateRef,
  useSetNotifyState,
  useSetPlaySpeedState,
} from "../atoms/stateAtoms";
import { useGetTime } from "./useGetTime";

export const useVideoSpeedChange = () => {
  const setSpeedData = useSetPlaySpeedState();
  const setNotify = useSetNotifyState();
  const { getCurrentLineTime, getCurrentOffsettedYTTime } = useGetTime();

  const { readPlayer } = usePlayer();
  const { writeGameUtils } = useGameUtilsRef();
  const { readLineStatusRef, writeLineStatusRef } = useLineStatusRef();
  const readPlaySpeed = usePlaySpeedStateRef();
  const readScene = useSceneStateRef();

  const defaultSpeedChange = (type: "up" | "down" | "set", setSpeed: number = 1) => {
    const defaultSpeed = readPlaySpeed().defaultSpeed;

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

    const scene = readScene();

    const isPlayed = scene === "playing" || scene === "replay" || scene === "practice";

    if (scene === "ready") {
      writeGameUtils({ startPlaySpeed: setSpeed });
    } else if (isPlayed) {
      setNotify(Symbol(`${setSpeed.toFixed(2)}x`));
    }
  };

  const playingSpeedChange = async (type: "set" | "change" = "change", setSpeed: number = 1) => {
    const defaultSpeed = readPlaySpeed().defaultSpeed;
    const currentSpeed = readPlaySpeed().playSpeed;

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

    const scene = readScene();

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
