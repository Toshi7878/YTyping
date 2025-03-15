import {
  useSceneStateRef,
  useSetLineWordState,
  useSetLyricsState,
  useSetNextLyricsState,
} from "@/app/type/atoms/stateAtoms";
import { useEffect } from "react";
import PlayingCenter from "./playing-child/PlayingCenter";

import { useGameUtilsRef, useUserStatsRef } from "@/app/type/atoms/refAtoms";
import { useHandleKeydown } from "@/app/type/hooks/playing-hooks/keydown-hooks/useHandleKeydown";
import { useStartTimer } from "@/app/type/hooks/playing-hooks/timer-hooks/useStartTimer";
import { usePlayTimer } from "@/app/type/hooks/playing-hooks/timer-hooks/useTimer";
import { typeTicker } from "@/app/type/ts/const/consts";
import { RESET } from "jotai/utils";

const Playing = () => {
  const setLineWord = useSetLineWordState();
  const setLyrics = useSetLyricsState();
  const setNextLyrics = useSetNextLyricsState();
  const startTimer = useStartTimer();
  const playTimer = usePlayTimer();
  const handleKeydown = useHandleKeydown();
  const { readUserStatsRef, resetUserStatsRef } = useUserStatsRef();
  const { readGameUtils } = useGameUtilsRef();
  const readScene = useSceneStateRef();

  useEffect(() => {
    const handleVisibilitychange = () => {
      if (document.visibilityState === "hidden") {
        const sendStats = readUserStatsRef();
        const maxCombo = sendStats.maxCombo;
        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_API_URL}/api/update-user-typing-stats`,
          JSON.stringify(sendStats)
        );

        resetUserStatsRef(structuredClone(maxCombo));
      }
    };
    const handleBeforeunload = () => {
      const sendStats = readUserStatsRef();
      const maxCombo = sendStats.maxCombo;
      navigator.sendBeacon(
        `${process.env.NEXT_PUBLIC_API_URL}/api/update-user-typing-stats`,
        JSON.stringify(sendStats)
      );
      resetUserStatsRef(structuredClone(maxCombo));
    };

    const scene = readScene();
    if (scene === "playing" || scene === "practice") {
      window.addEventListener("beforeunload", handleBeforeunload);
      window.addEventListener("visibilitychange", handleVisibilitychange);
    }
    return () => {
      window.removeEventListener("beforeunload", handleBeforeunload);
      window.removeEventListener("visibilitychange", handleVisibilitychange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const scene = readScene();

    if (scene === "practice") {
      const { lineResultdrawerClosure: drawerClosure } = readGameUtils();
      drawerClosure!.onOpen();
    }

    if (scene === "replay") {
      // リプレイモードは制限なし
      typeTicker.maxFPS = 0;
      typeTicker.minFPS = 0;
    } else {
      typeTicker.maxFPS = 59.99;
      typeTicker.minFPS = 59.99;
    }
    typeTicker.add(playTimer);

    startTimer();
    window.addEventListener("keydown", handleKeydown);

    return () => {
      if (typeTicker.started) {
        typeTicker.remove(playTimer);
        typeTicker.stop();
      }

      window.removeEventListener("keydown", handleKeydown);
      setLineWord(RESET);
      setLyrics("");
      setNextLyrics(RESET);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <PlayingCenter flex="1" />;
};

export default Playing;
