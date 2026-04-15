"use client";

import {
  createTypingWord,
  evaluateKanaInput,
  evaluateRomaInput,
  type InputMode,
  isTypingKey,
  type TypingWord,
  type WordChunk,
} from "lyrics-typing-engine";
import { useEffect } from "react";
import {
  getBuiltMap,
  readReplayRankingResult,
  readUtilityParams,
  useBuiltMapState,
  useSceneState,
} from "@/app/(typing)/type/_feature/atoms/state";
import { getSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { getTimezone } from "@/utils/date";
import { getBaseUrl } from "@/utils/get-base-url";
import { useActiveElement } from "@/utils/hooks/use-active-element";
import { readTypingOptions } from "../../atoms/hydrate";
import { readLineCount, readTypingStats, resetTypingStats, type TypingStats } from "../../atoms/ref";
import { getTypingWord, setTypingWord } from "../../atoms/typing-word";
import { resetCurrentLine } from "../../lib/play-restart";
import { triggerMissSound, triggerTypeCompletedSound, triggerTypeSound } from "../../lib/sound-effect";
import { getRemainLineTime } from "../../youtube/get-youtube-time";
import { getActiveSkipKey, skipLine } from "../footer/skip";
import { ChangeCSS } from "./change-css-style";
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

interface PlayingProps {
  className: string;
}

export const PlayingScene = ({ className }: PlayingProps) => {
  const scene = useSceneState();
  const activeElement = useActiveElement();

  useEffect(() => {
    const handleVisibilitychange = () => {
      if (document.visibilityState === "hidden") {
        const stats = readTypingStats();
        sendTypingStats(stats);
      }
    };
    const handleBeforeunload = () => {
      const stats = readTypingStats();
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

    const count = readLineCount();
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
          const count = readLineCount();
          skipLine(count);
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

  const typingWord = getTypingWord();
  if (shouldAcceptTyping && typingWord.nextChunk.kana && isTypingKey(event)) {
    const map = getBuiltMap();
    if (!map) return;

    const typingOptions = readTypingOptions();
    const { otherStatus } = readReplayRankingResult() ?? {};
    const isCaseSensitive = otherStatus?.isCaseSensitive ?? (map.isCaseSensitive || typingOptions.isCaseSensitive);
    const { inputMode } = readUtilityParams();

    evaluateInput(
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

        onLineCompleted: ({ constantLineTime }) => {
          triggerTypeCompletedSound();

          if (!isPaused) {
            updateTypingTime({ constantLineTime });
          }

          const count = readLineCount();
          if (hasLineResultImproved(count)) {
            saveLineResult(count);
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

const evaluateInput = (
  {
    event,
    inputMode,
    isCaseSensitive,
    typingWord,
  }: {
    event: KeyboardEvent;
    inputMode: InputMode;
    isCaseSensitive: boolean;
    typingWord: TypingWord;
  },
  {
    onSuccess,
    onMiss,
    onLineCompleted,
  }: {
    onSuccess: (result: {
      nextTypingWord: TypingWord;
      successKey: string;
      isCompleted: boolean;
      updatePoint: number;
      chunkType: WordChunk["type"];
    }) => { constantLineTime: number };
    onMiss: (result: { failKey: string }) => void;
    onLineCompleted: (result: { constantLineTime: number }) => void;
  },
) => {
  const result =
    inputMode === "roma"
      ? evaluateRomaInput({ event, typingWord, isCaseSensitive })
      : evaluateKanaInput({ event, typingWord, isCaseSensitive });

  if (result.successKey) {
    const { nextTypingWord, successKey, isCompleted, updatePoint, chunkType } = result;

    const { constantLineTime } = onSuccess({
      nextTypingWord,
      successKey,
      isCompleted,
      updatePoint,
      chunkType,
    });

    if (isCompleted) {
      onLineCompleted({ constantLineTime });
    }
  } else if (result.failKey) {
    onMiss({ failKey: result.failKey });
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
