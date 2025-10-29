"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import {
  useMapState,
  useReadGameUtilityParams,
  useSceneState,
  useSetCurrentLine,
  useSetLineResultDrawer,
  useSetNextLyrics,
} from "@/app/(typing)/type/_lib/atoms/state-atoms";
import { cn } from "@/lib/utils";
import { getBaseUrl } from "@/utils/get-base-url";
import { useActiveElement } from "@/utils/hooks/use-active-element";
import { useLineCount, useUserStats } from "../../../_lib/atoms/read-atoms";
import { usePressSkip } from "../../../_lib/playing/keydown/hot-key/use-press-skip";
import { useOnKeydown } from "../../../_lib/playing/keydown/use-keydown-event";
import { timerControls } from "../../../_lib/playing/timer/use-timer";
import { ChangeCSS } from "./playing-child/change-css-style";
import { Lyrics } from "./playing-child/lyrics-text";
import { NextLyrics } from "./playing-child/next-lyrics";
import { TypingWords } from "./playing-child/typing-words";

interface PlayingProps {
  className?: string;
}

export const PlayingScene = ({ className }: PlayingProps) => {
  const pressSkip = usePressSkip();
  const readGameUtilityParams = useReadGameUtilityParams();

  const { data: session } = useSession();
  const { readUserStats, resetUserStats } = useUserStats();
  const { resetCurrentLine } = useSetCurrentLine();

  const scene = useSceneState();
  const activeElement = useActiveElement();

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
  const handleKeydown = useOnKeydown();
  const { readCount } = useLineCount();
  const setLineResultDrawer = useSetLineResultDrawer();
  const map = useMapState();

  useEffect(() => {
    if (scene === "practice") {
      setLineResultDrawer(true);
    }

    if (scene === "replay") {
      timerControls.setFrameRate(0);
    } else {
      timerControls.setFrameRate(59.99);
    }

    const count = readCount();
    if (count === 0 && map) {
      setNextLyrics(map.mapData[1]);
      resetCurrentLine();
    } else {
      resetNextLyrics();
    }
  }, [scene, map]);

  // text系inputにフォーカスが当たっている場合はkeydownイベントを登録しない
  useEffect(() => {
    const isTextInput = activeElement?.tagName === "INPUT" || activeElement?.tagName === "TEXTAREA";

    if (!isTextInput) {
      window.addEventListener("keydown", handleKeydown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [activeElement, handleKeydown]);

  return (
    <div
      className={cn("flex cursor-none flex-col items-start justify-between truncate select-none", className)}
      id="typing_scene"
      onTouchStart={() => {
        const { activeSkipKey } = readGameUtilityParams();

        if (activeSkipKey) {
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
