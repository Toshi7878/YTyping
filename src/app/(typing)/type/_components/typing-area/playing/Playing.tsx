import {
  useReadGameUtilParams,
  useReadMapState,
  useSceneState,
  useSetLineResultDrawer,
  useSetNextLyrics,
} from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { useEffect } from "react";

import { useLineCount, useUserStats } from "@/app/(typing)/type/_lib/atoms/refAtoms";
import { useHandleKeydown } from "@/app/(typing)/type/_lib/hooks/playing-hooks/keydown-hooks/playingKeydown";
import { useTimerControls } from "@/app/(typing)/type/_lib/hooks/playing-hooks/timer-hooks/timer";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { usePressSkip } from "../../../_lib/hooks/playing-hooks/pressSkip";
import ChangeCSS from "./playing-child/ChangeCSS";
import Lyrics from "./playing-child/Lyrics";
import NextLyrics from "./playing-child/NextLyrics";
import TypingWords from "./playing-child/PlayingTypingWords";

interface PlayingProps {
  className?: string;
}

const Playing = ({ className }: PlayingProps) => {
  const pressSkip = usePressSkip();
  const readGameUtils = useReadGameUtilParams();
  const { data: session } = useSession();
  const { setNextLyrics } = useSetNextLyrics();
  const handleKeydown = useHandleKeydown();
  const { readUserStats, resetUserStats } = useUserStats();
  const { readCount } = useLineCount();
  const scene = useSceneState();
  const { setFrameRate } = useTimerControls();
  const readMap = useReadMapState();
  const setLineResultDrawer = useSetLineResultDrawer();

  useEffect(() => {
    const handleVisibilitychange = () => {
      if (document.visibilityState === "hidden") {
        const sendStats = readUserStats();
        const maxCombo = sendStats.maxCombo;
        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_API_URL}/api/update-user-typing-stats`,
          JSON.stringify({ ...sendStats, userId: Number(session?.user.id ?? 0) }),
        );

        resetUserStats(structuredClone(maxCombo));
      }
    };
    const handleBeforeunload = () => {
      const sendStats = readUserStats();
      const maxCombo = sendStats.maxCombo;
      navigator.sendBeacon(
        `${process.env.NEXT_PUBLIC_API_URL}/api/update-user-typing-stats`,
        JSON.stringify({ ...sendStats, userId: Number(session?.user.id ?? 0) }),
      );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

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
    if (count === 0) {
      const map = readMap();
      setNextLyrics(map.mapData[1]);
    }

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  return (
    <div
      className={cn(
        "-ml-2 flex flex-1 cursor-none flex-col items-start justify-between truncate select-none",
        className,
      )}
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
