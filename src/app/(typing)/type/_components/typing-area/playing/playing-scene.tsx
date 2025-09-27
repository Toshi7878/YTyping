"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import {
  useMapState,
  useReadGameUtilParams,
  useSceneState,
  useSetLineResultDrawer,
  useSetNextLyrics,
} from "@/app/(typing)/type/_lib/atoms/state-atoms";
import { cn } from "@/lib/utils";
import { getBaseUrl } from "@/utils/get-base-url";
import { useLineCount, useUserStats } from "../../../_lib/atoms/ref-atoms";
import { useHandleKeydown } from "../../../_lib/hooks/playing/keydown/keydown";
import { usePressSkip } from "../../../_lib/hooks/playing/press-skip";
import { useTimerControls } from "../../../_lib/hooks/playing/timer/timer";
import ChangeCSS from "./playing-child/change-css-style";
import Lyrics from "./playing-child/lyrics-text";
import NextLyrics from "./playing-child/next-lyrics";
import TypingWords from "./playing-child/typing-words";

interface PlayingProps {
  className?: string;
}

const Playing = ({ className }: PlayingProps) => {
  const pressSkip = usePressSkip();
  const readGameUtils = useReadGameUtilParams();

  const { data: session } = useSession();
  const { readUserStats, resetUserStats } = useUserStats();
  const scene = useSceneState();

  useEffect(() => {
    const handleVisibilitychange = () => {
      if (document.visibilityState === "hidden") {
        const sendStats = readUserStats();
        const { maxCombo } = sendStats;
        const url = `${getBaseUrl()}/api/user-stats/typing/increment`;
        const body = new Blob([JSON.stringify({ ...sendStats, userId: Number(session?.user.id ?? 0) })], {
          type: "application/json",
        });
        navigator.sendBeacon(url, body);

        resetUserStats(structuredClone(maxCombo));
      }
    };
    const handleBeforeunload = () => {
      const sendStats = readUserStats();
      const { maxCombo } = sendStats;
      const url = `${getBaseUrl()}/api/user-stats/typing/increment`;
      const body = new Blob([JSON.stringify({ ...sendStats, userId: Number(session?.user.id ?? 0) })], {
        type: "application/json",
      });
      navigator.sendBeacon(url, body);
      resetUserStats(structuredClone(maxCombo));
    };

    if (scene === "play" || scene === "practice") {
      window.addEventListener("beforeunload", handleBeforeunload);
      window.addEventListener("visibilitychange", handleVisibilitychange);
    }
    return () => {
      window.removeEventListener("beforeunload", handleBeforeunload);
      window.removeEventListener("visibilitychange", handleVisibilitychange);
    };
  }, [scene]);

  const { setNextLyrics, resetNextLyrics } = useSetNextLyrics();
  const handleKeydown = useHandleKeydown();
  const { readCount } = useLineCount();
  const { setFrameRate } = useTimerControls();
  const setLineResultDrawer = useSetLineResultDrawer();
  const map = useMapState();

  useEffect(() => {
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
  }, [scene, map]);

  return (
    <div
      className={cn("flex cursor-none flex-col items-start justify-between truncate select-none", className)}
      id="typing_scene"
      onTouchStart={() => {
        const { skip } = readGameUtils();

        if (skip) {
          pressSkip();
        }
      }}
    >
      <TypingWords />
      <Lyrics />
      <NextLyrics />
      <ChangeCSS />
    </div>
  );
};

export default Playing;
