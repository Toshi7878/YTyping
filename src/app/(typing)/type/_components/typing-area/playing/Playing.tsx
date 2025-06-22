import {
  useReadGameUtilParams,
  useReadMapState,
  useSceneState,
  useSetNextLyrics,
} from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { useEffect } from "react";

import { useGameUtilityReferenceParams, useLineCount, useUserStats } from "@/app/(typing)/type/_lib/atoms/refAtoms";
import { useHandleKeydown } from "@/app/(typing)/type/_lib/hooks/playing-hooks/keydown-hooks/playingKeydown";
import { useTimerControls } from "@/app/(typing)/type/_lib/hooks/playing-hooks/timer-hooks/timer";
import { useSession } from "next-auth/react";
import { usePressSkip } from "../../../_lib/hooks/playing-hooks/pressSkip";
import ChangeCSS from "./playing-child/ChangeCSS";
import Lyrics from "./playing-child/Lyrics";
import NextLyrics from "./playing-child/NextLyrics";
import TypingWords from "./playing-child/PlayingTypingWords";

const Playing = () => {
  const { data: session } = useSession();
  const { setNextLyrics } = useSetNextLyrics();
  const handleKeydown = useHandleKeydown();
  const { readUserStats, resetUserStats } = useUserStats();
  const { readGameUtilRefParams } = useGameUtilityReferenceParams();
  const { readCount } = useLineCount();
  const scene = useSceneState();
  const { setFrameRate } = useTimerControls();
  const readMap = useReadMapState();

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
      const { lineResultdrawerClosure: drawerClosure } = readGameUtilRefParams();
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

const CARD_BODY_MIN_HEIGHT = { base: "460px", md: "320px" };

interface PlayingCenterProps {
  flex: string;
}

const PlayingCenter = ({ flex }: PlayingCenterProps) => {
  const pressSkip = usePressSkip();
  const readGameUtils = useReadGameUtilParams();

  return (
    <div
      className="-ml-2 flex cursor-none flex-col items-start justify-between truncate select-none"
      style={{ flex: flex, minHeight: CARD_BODY_MIN_HEIGHT.md }}
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
