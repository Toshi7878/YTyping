"use client";

import { atom, type SetStateAction } from "jotai";
import { createTypingWord, handleTyping, isTypingKey } from "lyrics-typing-engine";
import { useEffect } from "react";
import { getBuiltMap, useBuiltMapState } from "@/app/(typing)/type/_feature/atoms/built-map";
import { getSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
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
const lineCountAtom = atom(0);
export const getLineCount = () => store.get(lineCountAtom);
export const setLineCount = (updater: SetStateAction<number>) => store.set(lineCountAtom, updater);

interface PlayingProps {
  className: string;
}

export const PlayingScene = ({ className }: PlayingProps) => {
  const scene = useSceneState();
  const activeElement = useActiveElement();

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

const handleKeyDown = (event: KeyboardEvent) => {
  const isPaused = getIsPaused();
  const scene = getScene();

  const shouldAcceptTyping = (!isPaused && scene === "play") || scene === "practice";

  const typingWord = getTypingWord();
  if (shouldAcceptTyping && typingWord.nextChunk.kana && isTypingKey(event)) {
    const map = getBuiltMap();
    if (!map) return;

    const typingOptions = getTypingOptions();
    const { otherStatus } = getReplayRankingResult() ?? {};
    const isCaseSensitive = otherStatus?.isCaseSensitive ?? (map.isCaseSensitive || typingOptions.isCaseSensitive);
    const inputMode = getPlayingInputMode();

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

          return { constantLineTime };
        },

        onMiss: ({ failKey }) => {
          if (!typingWord.correct.roma) return;
          const { constantLineTime } = getRemainLineTime();

          triggerMissSound();
          updateMissStatus();
          updateMissSubstatus({ constantLineTime, failKey });
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
