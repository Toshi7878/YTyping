import {
  useSceneState,
  useSetLineWordState,
  useSetLyricsState,
  useSetNextLyricsState,
} from "@/app/type/atoms/stateAtoms";
import { useEffect } from "react";
import PlayingCenter from "./playing-child/PlayingCenter";

import { useGameUtilsRef, useUserStatsRef } from "@/app/type/atoms/refAtoms";
import { useHandleKeydown } from "@/app/type/hooks/playing-hooks/keydown-hooks/useHandleKeydown";
import { useTimerControls } from "@/app/type/hooks/playing-hooks/timer-hooks/useTimer";
import { RESET } from "jotai/utils";
import { useSession } from "next-auth/react";

const Playing = () => {
  const { data: session } = useSession();
  const setLineWord = useSetLineWordState();
  const setLyrics = useSetLyricsState();
  const setNextLyrics = useSetNextLyricsState();
  const handleKeydown = useHandleKeydown();
  const { readUserStats, resetUserStats } = useUserStatsRef();
  const { readGameUtils } = useGameUtilsRef();
  const scene = useSceneState();
  const { setFrameRate } = useTimerControls();

  useEffect(() => {
    const handleVisibilitychange = () => {
      if (document.visibilityState === "hidden") {
        const sendStats = readUserStats();
        const maxCombo = sendStats.maxCombo;
        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_API_URL}/api/update-user-typing-stats`,
          JSON.stringify({ ...sendStats, userId: Number(session?.user.id ?? 0) })
        );

        resetUserStats(structuredClone(maxCombo));
      }
    };
    const handleBeforeunload = () => {
      const sendStats = readUserStats();
      const maxCombo = sendStats.maxCombo;
      navigator.sendBeacon(
        `${process.env.NEXT_PUBLIC_API_URL}/api/update-user-typing-stats`,
        JSON.stringify({ ...sendStats, userId: Number(session?.user.id ?? 0) })
      );
      resetUserStats(structuredClone(maxCombo));
    };

    if (scene === "playing" || scene === "practice") {
      window.addEventListener("beforeunload", handleBeforeunload);
      window.addEventListener("visibilitychange", handleVisibilitychange);
    }
    return () => {
      window.removeEventListener("beforeunload", handleBeforeunload);
      window.removeEventListener("visibilitychange", handleVisibilitychange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  useEffect(() => {
    if (scene === "practice") {
      const { lineResultdrawerClosure: drawerClosure } = readGameUtils();
      drawerClosure!.onOpen();
    }

    if (scene === "replay") {
      // リプレイモードは制限なし
      setFrameRate(0);
    } else {
      setFrameRate(59.99);
    }

    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      setLineWord(RESET);
      setLyrics("");
      setNextLyrics(RESET);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  return <PlayingCenter flex="1" />;
};

export default Playing;
