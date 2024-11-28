import { useRefs } from "../type-contexts/refsProvider";
import {
  sceneAtom,
  speedAtom,
  useSetPlayingNotifyAtom,
  useSetTypePageSpeedAtom,
} from "../type-atoms/gameRenderAtoms";
import { useGetTime } from "./useGetTime";
import { useStore } from "jotai";

export const useVideoSpeedChange = () => {
  const typeAtomStore = useStore();
  const setSpeedData = useSetTypePageSpeedAtom();
  const setNotify = useSetPlayingNotifyAtom();
  const { playerRef, gameStateRef, statusRef } = useRefs();
  const { getCurrentLineTime, getCurrentOffsettedYTTime } = useGetTime();

  const defaultSpeedChange = (type: "up" | "down" | "set", setSpeed: number = 1) => {
    const defaultSpeed = typeAtomStore.get(speedAtom).defaultSpeed;

    if (type === "up") {
      if (defaultSpeed < 2) {
        setSpeed = defaultSpeed + 0.25;
      }
    } else if (type === "down") {
      if (defaultSpeed > 0.25) {
        setSpeed = defaultSpeed - 0.25;
      }
    }

    setSpeedData({ defaultSpeed: setSpeed, playSpeed: setSpeed });
    playerRef.current.setPlaybackRate(setSpeed);

    const scene = typeAtomStore.get(sceneAtom);

    if (scene === "ready" && gameStateRef.current) {
      gameStateRef.current.startPlaySpeed = setSpeed;
    } else if (scene === "playing") {
      setNotify(Symbol(`${setSpeed.toFixed(2)}x`));
    }
  };

  const playingSpeedChange = (type: "set" | "change" = "change", setSpeed: number = 1) => {
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

    playerRef.current.setPlaybackRate(setSpeed);

    if (currentSpeed !== setSpeed) {
      setNotify(Symbol(`${setSpeed.toFixed(2)}x`));
    }

    const scene = typeAtomStore.get(sceneAtom);

    if (scene === "playing") {
      const lineTime = getCurrentLineTime(getCurrentOffsettedYTTime());

      statusRef.current!.lineStatus.typeResult.push({
        op: "speedChange",
        t: Math.round(lineTime * 1000) / 1000,
      });
    }
  };

  return { defaultSpeedChange, playingSpeedChange };
};