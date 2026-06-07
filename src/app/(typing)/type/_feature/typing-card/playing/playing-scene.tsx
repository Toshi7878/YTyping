"use client";

import { atom, type SetStateAction } from "jotai";
import { createTypingWord, executeTypingInput, handleTyping, isTypingKey } from "lyrics-typing-engine";
import { useEffect } from "react";
import { getBuiltMap, useBuiltMapState } from "@/app/(typing)/type/_feature/atoms/built-map";
import { getSession } from "@/auth/client";
import type { FlickEvent } from "@/ui/flick-keyboard";
import { cn } from "@/utils/cn";
import { getTimezone } from "@/utils/date";
import { getBaseUrl } from "@/utils/get-base-url";
import { useActiveElement } from "@/utils/hooks/use-active-element";
import { getReplayRankingResult } from "../../atoms/replay";
import { getTypingStats, resetTypingStats, type TypingStats } from "../../atoms/stats";
import { store } from "../../atoms/store";
import { getPlayingInputMode, getTypingWord, setTypingWord } from "../../atoms/typing-word";
import { resetCurrentLine } from "../../lib/play-restart";
import { triggerMissSound, triggerTypeCompletedSound, triggerTypeSound } from "../../lib/sound-effect";
import { getTypingOptions } from "../../tabs/setting/popover";
import { dispatchTypeEvent } from "../../user-script";
import { getRemainLineTime } from "../../youtube/get-youtube-time";
import { getIsPaused } from "../../youtube/youtube-player";
import { getActiveSkipKey, skipLine } from "../footer/skip";
import { getScene, useSceneState } from "../typing-card";
import { isHotKeyIgnored, playHotkey } from "./hotkey";
import { Lyrics } from "./lyrics";
import { NextLyrics, setNextLyricsAndKpm } from "./next-lyrics";
import { hasLineResultImproved, saveLineResult } from "./save-line-result";
import { setTimerMaxFPS } from "./timer/timer";
import { TypingWords } from "./typing-words";
import { updateMissStatus, updateMissSubstatus } from "./update-status/miss";
import { recalculateStatusFromResults } from "./update-status/recalc-from-results";
import { updateSuccessStatus, updateSuccessSubstatus } from "./update-status/success";
import { updateTypingTime } from "./update-status/update-kpm";

const timeOffsetAtom = atom(0);
export const getTimeOffset = () => store.get(timeOffsetAtom);
export const setTimeOffset = (updater: SetStateAction<number>) => store.set(timeOffsetAtom, updater);
export const resetTimeOffset = () => store.set(timeOffsetAtom, 0);
const lineCountAtom = atom(0);
export const getLineCount = () => store.get(lineCountAtom);
export const setLineCount = (updater: SetStateAction<number>) => store.set(lineCountAtom, updater);
export const resetLineCount = () => store.set(lineCountAtom, 0);

interface PlayingProps {
  className: string;
}

export const PlayingScene = ({ className }: PlayingProps) => {
  const activeElement = useActiveElement();
  usePlayingSetup();

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
      className={cn("flex cursor-none select-none flex-col items-start justify-between truncate", className)}
      id="typing_scene"
      onTouchStart={() => {
        if (getActiveSkipKey()) {
          const count = getLineCount();
          skipLine(count);
        }
      }}
    >
      <TypingWords />
      <Lyrics />
      <NextLyrics />
    </div>
  );
};

export const usePlayingSetup = () => {
  const scene = useSceneState();

  useEffect(() => {
    const handleVisibilitychange = () => {
      if (document.visibilityState === "hidden") {
        const stats = getTypingStats();
        sendTypingStats(stats);
      }
    };
    const handleBeforeunload = () => {
      const stats = getTypingStats();
      sendTypingStats(stats);
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

  const map = useBuiltMapState();

  useEffect(() => {
    if (scene === "replay") {
      setTimerMaxFPS(0);
    } else {
      setTimerMaxFPS(59.99);
    }

    const count = getLineCount();
    const nextLine = map?.lines[1];
    if (count === 0 && map && nextLine) {
      setNextLyricsAndKpm(nextLine);
      resetCurrentLine(map);
    }
  }, [scene, map]);
};

const handleKeyDown = (event: KeyboardEvent) => {
  const isPaused = getIsPaused();
  const scene = getScene();

  const shouldAcceptTyping = (!isPaused && scene === "play") || scene === "practice";

  const typingWord = getTypingWord();
  const inputMode = getPlayingInputMode();
  if (shouldAcceptTyping && typingWord.nextChunk.kana && isTypingKey(event) && inputMode !== "flick") {
    const map = getBuiltMap();
    if (!map) return;

    const typingOptions = getTypingOptions();
    const { otherStatus } = getReplayRankingResult() ?? {};
    const isCaseSensitive = otherStatus?.isCaseSensitive ?? (map.isCaseSensitive || typingOptions.isCaseSensitive);

    handleTyping(
      { event, inputMode, isCaseSensitive, typingWord },
      {
        onSuccess: ({ nextTypingWord, successKey, isCompleted, updatePoint, chunkType }) => {
          const { constantLineTime, constantRemainLineTime } = getRemainLineTime();
          if (isCompleted) {
            triggerTypeCompletedSound();
          } else {
            triggerTypeSound();
          }
          setTypingWord(nextTypingWord);
          updateSuccessStatus({ isCompleted, constantRemainLineTime, updatePoint, constantLineTime });
          updateSuccessSubstatus({ constantLineTime, isCompleted, successKey, chunkType });
          dispatchTypeEvent("type:success", { successKey, isCompleted, chunkType, constantLineTime, updatePoint });

          return { constantLineTime };
        },

        onMiss: ({ failKey }) => {
          if (!typingWord.correct.roma) return;
          const { constantLineTime } = getRemainLineTime();

          triggerMissSound();
          updateMissStatus();
          updateMissSubstatus({ constantLineTime, failKey });
          dispatchTypeEvent("type:miss", { failKey });
        },

        onCompleted: ({ constantLineTime }) => {
          triggerTypeCompletedSound();

          if (!isPaused) {
            updateTypingTime({ constantLineTime });
          }

          const count = getLineCount();
          if (hasLineResultImproved(count)) {
            saveLineResult(count, constantLineTime);
          }

          dispatchTypeEvent("type:lineCompleted", { constantLineTime });

          if (scene === "practice") {
            recalculateStatusFromResults({ count: map.lines.length - 1, updateType: "completed" });

            if (isPaused) {
              const newCurrentLine = map.lines[count];
              if (!newCurrentLine) return;
              setTypingWord(createTypingWord(newCurrentLine));
            }
          }
        },
      },
    );

    event.preventDefault();
    return;
  }

  if (!isHotKeyIgnored(event)) {
    playHotkey(event);
  }
};

export const handleFlickInput = (e: FlickEvent) => {
  const isPaused = getIsPaused();
  const scene = getScene();
  const shouldAcceptTyping = (!isPaused && scene === "play") || scene === "practice";
  if (!shouldAcceptTyping) return;

  const typingWord = getTypingWord();
  if (!typingWord.nextChunk.kana) return;

  const map = getBuiltMap();
  if (!map) return;

  let inputChar: string | null = null;

  if (e.type === "tap") {
    if (e.key.type === "mod") {
      const nextKana = typingWord.nextChunk.kana[0];
      if (nextKana === "゛" || nextKana === "゜") inputChar = nextKana;
    } else if (e.key.type !== "caps") {
      inputChar = e.key.c;
    }
  } else if (e.type === "flick") {
    inputChar = e.char;
  } else if (e.type === "mod") {
    const nextKana = typingWord.nextChunk.kana[0];
    if (nextKana === "゛" || nextKana === "゜") inputChar = nextKana;
  }

  if (!inputChar) return;

  const typingOptions = getTypingOptions();
  const { otherStatus } = getReplayRankingResult() ?? {};
  const isCaseSensitive = otherStatus?.isCaseSensitive ?? (map.isCaseSensitive || typingOptions.isCaseSensitive);

  const { nextTypingWord, successKey, failKey, isCompleted, updatePoint, chunkType } = executeTypingInput({
    inputChar,
    inputMode: "kana",
    typingWord,
    isCaseSensitive,
  });

  if (successKey) {
    const { constantLineTime, constantRemainLineTime } = getRemainLineTime();
    if (isCompleted) {
      triggerTypeCompletedSound();
    } else {
      triggerTypeSound();
    }
    setTypingWord(nextTypingWord);
    updateSuccessStatus({ isCompleted, constantRemainLineTime, updatePoint, constantLineTime });
    updateSuccessSubstatus({ constantLineTime, isCompleted, successKey, chunkType });
    dispatchTypeEvent("type:success", { successKey, isCompleted, chunkType, constantLineTime, updatePoint });

    if (isCompleted) {
      triggerTypeCompletedSound();

      if (!isPaused) {
        updateTypingTime({ constantLineTime });
      }

      const count = getLineCount();
      if (hasLineResultImproved(count)) {
        saveLineResult(count, constantLineTime);
      }

      dispatchTypeEvent("type:lineCompleted", { constantLineTime });

      if (scene === "practice") {
        recalculateStatusFromResults({ count: map.lines.length - 1, updateType: "completed" });

        if (isPaused) {
          const newCurrentLine = map.lines[count];
          if (!newCurrentLine) return;
          setTypingWord(createTypingWord(newCurrentLine));
        }
      }
    }
  } else if (failKey) {
    if (!typingWord.correct.roma) return;
    const { constantLineTime } = getRemainLineTime();
    triggerMissSound();
    updateMissStatus();
    updateMissSubstatus({ constantLineTime, failKey });
    dispatchTypeEvent("type:miss", { failKey });
  }
};

const sendTypingStats = (stats: TypingStats) => {
  const session = getSession();
  if (!session) return;
  if (Object.values(stats).every((v) => v === 0)) return;

  const timezone = getTimezone();

  const url = `${getBaseUrl()}/api/internal/user-stats/typing/increment`;
  const body = new Blob([JSON.stringify({ ...stats, timezone })], {
    type: "application/json",
  });
  navigator.sendBeacon(url, body);
  resetTypingStats();
};
