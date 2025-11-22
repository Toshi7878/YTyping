"use client";

import { evaluateKanaTypingInput, evaluateRomaTypingInput, isTypingKey } from "lyrics-typing-engine";
import { useEffect } from "react";
import {
  readLineWord,
  readUtilityParams,
  resetCurrentLine,
  resetNextLyrics,
  setLineResultSheet,
  setNextLyrics,
  useBuiltMapState,
  useSceneState,
} from "@/app/(typing)/type/_lib/atoms/state";
import { env } from "@/env";
import { cn } from "@/lib/utils";
import { getBaseUrl } from "@/utils/get-base-url";
import { useActiveElement } from "@/utils/hooks/use-active-element";
import { readLineCount, readUserStats, resetUserStats } from "../../../_lib/atoms/ref";
import { commitLineSkip } from "../../../_lib/playing/commit-line-skip";
import { handlePlayHotKey, isHotKeyIgnored } from "../../../_lib/playing/keydown/handle-play-hot-key";
import { processTypingResult } from "../../../_lib/playing/keydown/process-typing-result";
import { setTimerFPS } from "../../../_lib/playing/timer/timer";
import { togglePause } from "../../../_lib/playing/toggle-pause";
import { ChangeCSS } from "./change-css-style";
import { Lyrics } from "./lyrics-text";
import { NextLyrics } from "./next-lyrics";
import { TypingWords } from "./typing-words";

interface PlayingProps {
  className: string;
}

export const PlayingScene = ({ className }: PlayingProps) => {
  const scene = useSceneState();
  const activeElement = useActiveElement();

  useEffect(() => {
    const handleVisibilitychange = () => {
      if (document.visibilityState === "hidden") {
        sendUserStats();
      }
    };
    const handleBeforeunload = () => {
      sendUserStats();
    };

    if (env.NODE_ENV !== "development" && (scene === "play" || scene === "practice")) {
      window.addEventListener("beforeunload", handleBeforeunload);
      window.addEventListener("visibilitychange", handleVisibilitychange);
    }
    return () => {
      window.removeEventListener("beforeunload", handleBeforeunload);
      window.removeEventListener("visibilitychange", handleVisibilitychange);
    };
  }, [scene]);

  const map = useBuiltMapState();

  useEffect(() => {
    if (scene === "practice") {
      setLineResultSheet(true);
    }

    if (scene === "replay") {
      setTimerFPS(0);
    } else {
      setTimerFPS(59.99);
    }

    const count = readLineCount();
    const nextLine = map?.lines[1];
    if (count === 0 && map && nextLine) {
      setNextLyrics(nextLine);
      resetCurrentLine();
    } else {
      resetNextLyrics();
    }
  }, [scene, map]);

  // text系inputにフォーカスが当たっている場合はkeydownイベントを登録しない
  useEffect(() => {
    const isTextInput = activeElement?.tagName === "INPUT" || activeElement?.tagName === "TEXTAREA";

    if (!isTextInput) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeElement]);

  return (
    <div
      className={cn("flex cursor-none flex-col items-start justify-between truncate select-none", className)}
      id="typing_scene"
      onTouchStart={() => {
        const { activeSkipKey } = readUtilityParams();

        if (activeSkipKey) {
          commitLineSkip();
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

const handleKeyDown = (event: KeyboardEvent) => {
  const { scene, isPaused } = readUtilityParams();

  const shouldAcceptTyping = (!isPaused && scene === "play") || scene === "practice";

  const lineWord = readLineWord();
  if (shouldAcceptTyping && lineWord.nextChar.kana && isTypingKey(event)) {
    const { inputMode } = readUtilityParams();
    const typingResult =
      inputMode === "roma" ? evaluateRomaTypingInput(event, lineWord) : evaluateKanaTypingInput(event, lineWord);
    processTypingResult(typingResult);
    event.preventDefault();
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    togglePause();
    return;
  }

  if (isPaused || isHotKeyIgnored(event)) return;
  handlePlayHotKey(event);
};

const sendUserStats = () => {
  const sendStats = readUserStats();
  const url = `${getBaseUrl()}/api/user-stats/typing/increment`;
  const body = new Blob([JSON.stringify({ ...sendStats })], {
    type: "application/json",
  });
  navigator.sendBeacon(url, body);
  resetUserStats();
};
