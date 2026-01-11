import { Ticker } from "@pixi/ticker";
import { evaluateImeInput } from "lyrics-ime-typing-engine";
import type React from "react";
import { useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { updateImeTypeCountStats, updateTypingTimeStats, writeTypingTextarea } from "../_lib/atoms/ref";
import {
  readBuiltMap,
  readImeTypeOptions,
  readTypingWord,
  readUtilityParams,
  readWordResults,
  resultDialogOpen,
  setCurrentWordIndex,
  setNotifications,
  setStatus,
  setWordResults,
  useSceneState,
  useTextareaPlaceholderTypeState,
} from "../_lib/atoms/state";
import { handleSceneEnd } from "../_lib/core/scene-control";
import { handleSkip } from "../_lib/core/skip";
import type { PlaceholderType, SceneType } from "../_lib/type";

const TICK_STOP_TIME = 1000;

export const InputTextarea = () => {
  const textareaPlaceholderType = useTextareaPlaceholderTypeState();
  const scene = useSceneState();

  const { startTicker, stopTicker, tickerRef, tickStartRef } = useTypingTimeTimer();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
      const { value } = e.currentTarget;
      e.preventDefault();
      const map = readBuiltMap();
      if (!map) return;

      const typingWord = readTypingWord();
      const wordResults = readWordResults();
      const { isCaseSensitive, includeRegexPattern, enableIncludeRegex } = readImeTypeOptions();

      const result = evaluateImeInput(value, typingWord, [...wordResults], map, {
        isCaseSensitive,
        includeRegexPattern,
        enableIncludeRegex,
      });

      for (const update of result.wordResultUpdates) {
        setWordResults(update);
      }

      if (result.typeCountDelta) {
        setStatus((prev) => {
          const newTypeCount = prev.typeCount + result.typeCountDelta;
          return {
            typeCount: Math.floor(newTypeCount),
            score: Math.round((1000 / map.totalNotes) * newTypeCount),
          };
        });

        if (result.nextWordIndex) {
          setCurrentWordIndex(result.nextWordIndex);
        }
      }
      if (result.typeCountStatsDelta) {
        updateImeTypeCountStats((prev) => prev + result.typeCountStatsDelta);
      }
      if (result.notificationsToAppend.length) {
        setNotifications((prev) => [...prev, ...result.notificationsToAppend]);
      }

      stopTicker();

      switch (value.toLowerCase().trim()) {
        case "skip": {
          const { skipRemainTime } = readUtilityParams();
          if (skipRemainTime !== null) {
            handleSkip();
          }
          break;
        }
        case "end": {
          const map = readBuiltMap();
          if (!map) return;

          const { count } = readUtilityParams();
          if (!map.lines[count]) {
            handleSceneEnd();
          }
          break;
        }
        case "result":
          if (scene === "end") {
            resultDialogOpen();
          }
          break;
      }

      e.currentTarget.value = "";
    }
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    if (scene === "play" && e.currentTarget.value.length > 0 && !tickerRef.current?.started) {
      startTicker();
    }

    tickStartRef.current = Date.now();
  };

  const lyricsTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (lyricsTextareaRef.current) {
      writeTypingTextarea(lyricsTextareaRef.current);
    }
  }, []);

  return (
    <div className="z-2 mx-auto flex w-[95%] items-center justify-center md:w-[85%]">
      <Textarea
        ref={lyricsTextareaRef}
        className="h-[130px] resize-none rounded-md px-4 font-bold text-2xl tracking-widest xl:text-3xl"
        autoComplete="off"
        placeholder={textareaPlaceholder({ scene, textareaPlaceholderType })}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
      />
    </div>
  );
};

const textareaPlaceholder = ({
  scene,
  textareaPlaceholderType,
}: {
  scene: SceneType;
  textareaPlaceholderType: PlaceholderType;
}) => {
  if (scene === "ready") {
    return "動画クリック / Enterでスタート";
  }

  if (textareaPlaceholderType === "skip") {
    return "ワードを入力（Enterで送信）\nskipを入力してスキップ";
  }

  if (textareaPlaceholderType === "end") {
    return "ワードを入力（Enterで送信）\nendを入力して終了";
  }

  if (scene === "end") {
    return "お疲れさまでした \nresultを入力すると結果を確認できます";
  }

  return "ワードを入力（Enterで送信）";
};

const useTypingTimeTimer = () => {
  const tickerRef = useRef<Ticker | null>(null);
  const elapsedRef = useRef(0);
  const tickStartRef = useRef(0);

  const onTick = (delta: number) => {
    elapsedRef.current += delta / 60;

    if (Date.now() - tickStartRef.current > TICK_STOP_TIME) {
      stopTicker();
    }
  };

  const startTicker = () => {
    if (!tickerRef.current) {
      tickerRef.current = new Ticker();
      tickerRef.current.add(onTick);
      tickerRef.current.maxFPS = 60;
      tickerRef.current.minFPS = 60;
    }
    elapsedRef.current = 0;
    tickerRef.current.start();
  };

  const stopTicker = () => {
    if (tickerRef.current) {
      tickerRef.current.stop();
      updateTypingTimeStats((prev) => prev + elapsedRef.current);
      elapsedRef.current = 0;
    }
  };

  return { startTicker, stopTicker, tickerRef, tickStartRef };
};
