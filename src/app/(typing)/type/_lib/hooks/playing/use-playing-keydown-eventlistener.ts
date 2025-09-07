import { useEffect } from "react";
import { useLineCount } from "../../atoms/refAtoms";
import {
  useMapState,
  useSceneGroupState,
  useSceneState,
  useSetLineResultDrawer,
  useSetNextLyrics,
} from "../../atoms/stateAtoms";
import { useHandleKeydown } from "./keydown/playingKeydown";
import { useTimerControls } from "./timer/timer";

const usePlayingKeydownEventListener = () => {
  const { setNextLyrics, resetNextLyrics } = useSetNextLyrics();
  const handleKeydown = useHandleKeydown();
  const { readCount } = useLineCount();
  const scene = useSceneState();
  const { setFrameRate } = useTimerControls();
  const setLineResultDrawer = useSetLineResultDrawer();
  const map = useMapState();
  const sceneGroup = useSceneGroupState();

  useEffect(() => {
    if (sceneGroup !== "Playing" || !map) return;

    if (scene === "practice") {
      setLineResultDrawer(true);
    }

    if (scene === "replay") {
      setFrameRate(0);
    } else {
      setFrameRate(59.99);
    }

    window.addEventListener("keydown", handleKeydown);

    const count = readCount();
    if (count === 0 && map) {
      setNextLyrics(map.mapData[1]);
    } else {
      resetNextLyrics();
    }

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [scene, map, sceneGroup]);
};

export default usePlayingKeydownEventListener;
