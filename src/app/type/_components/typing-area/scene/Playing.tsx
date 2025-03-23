import { useMapStateRef, useSceneState, useSetNextLyricsState } from "@/app/type/atoms/stateAtoms";
import { useEffect } from "react";
import PlayingCenter from "./playing-child/PlayingCenter";

import { useCountRef, useGameUtilsRef, useStatusRef, useUserStatsRef } from "@/app/type/atoms/refAtoms";
import { useHandleKeydown } from "@/app/type/hooks/playing-hooks/keydown-hooks/useKeydown";
import { useTimerControls } from "@/app/type/hooks/playing-hooks/timer-hooks/useTimer";
import { useSession } from "next-auth/react";

const Playing = () => {
  const { data: session } = useSession();
  const { setNextLyrics } = useSetNextLyricsState();
  const handleKeydown = useHandleKeydown();
  const { readUserStats, resetUserStats } = useUserStatsRef();
  const { readGameUtils } = useGameUtilsRef();
  const { readCount } = useCountRef();
  const { readStatus } = useStatusRef();
  const scene = useSceneState();
  const { setFrameRate } = useTimerControls();
  const readMap = useMapStateRef();

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

    const count = readCount();
    if (count === 0) {
      const map = readMap();
      setNextLyrics(map.mapData[1]);
    }

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  return <PlayingCenter flex="1" />;
};

export default Playing;
