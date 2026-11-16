import { Ticker } from "@pixi/ticker";
import { evaluateImeInput, type WordResult } from "lyrics-ime-typing-engine";
import { useTranslations } from "next-intl";
import type React from "react";
import { useEffect, useRef } from "react";
import { getSession } from "@/auth/client";
import { translate } from "@/i18n/translate";
import { Textarea } from "@/ui/textarea";
import { updateImeTypeCountStats, updateTypingTimeStats, writeTypingTextarea } from "../_lib/atoms/ref";
import {
  getBuiltMap,
  getTargetWords,
  readUtilityParams,
  useSceneState,
  useTextareaPlaceholderTypeState,
} from "../_lib/atoms/state";
import { handleSceneEnd } from "../_lib/core/scene-control";
import { handleSkip } from "../_lib/core/skip";
import type { PlaceholderType, SceneType } from "../_lib/type";
import { getUserResult, openResultDialog, updateUserResult } from "./memu/result-dialog";
import { addNotifications } from "./notifications";
import { getImeOptions } from "./provider";

const TICK_STOP_TIME = 1000;

export const InputTextarea = () => {
  const t = useTranslations("ime.placeholder");
  const textareaPlaceholderType = useTextareaPlaceholderTypeState();
  const scene = useSceneState();

  const { startTicker, stopTicker, tickerRef, tickStartRef } = useTypingTimeTimer();

  const handleSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
      const { value } = e.currentTarget;
      e.preventDefault();

      const session = getSession();
      const userId = session?.user.id.toString() || "default";
      const userResult = getUserResult(userId);

      const { typeCountStatsDelta, appendNotifications, ...result } = handleImeInput({
        value,
        currentWordIndex: userResult?.currentWordIndex,
        wordResults: userResult?.wordResults,
      });

      const userName = session?.user.name || translate("ime.guest");
      updateUserResult(userId, { name: userName, ...result });
      updateImeTypeCountStats((prev) => prev + typeCountStatsDelta);
      if (appendNotifications.length > 0) {
        addNotifications(appendNotifications.map((n) => `${userName}: ${n}`));
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
          const map = getBuiltMap();
          if (!map) return;

          const { count } = readUtilityParams();
          if (!map.lines[count]) {
            handleSceneEnd();
          }
          break;
        }
        case "result":
          if (scene === "end") {
            openResultDialog();
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
        id="typing_textarea"
        ref={lyricsTextareaRef}
        className="h-[130px] resize-none rounded-md px-4 font-bold text-2xl tracking-widest xl:text-3xl"
        autoComplete="off"
        placeholder={textareaPlaceholder({ scene, textareaPlaceholderType, t })}
        onKeyDown={handleSubmit}
        onInput={handleInput}
      />
    </div>
  );
};

export const handleImeInput = ({
  value,
  currentWordIndex,
  wordResults: _wordResults,
}: {
  value: string;
  currentWordIndex: number | undefined;
  wordResults: WordResult[] | undefined;
}) => {
  const map = getBuiltMap();
  if (!map) throw new Error("built map is not found.");
  const wordResults = _wordResults ? [..._wordResults] : [...map.initWordResults];

  const targetWords = getTargetWords();
  const result = evaluateImeInput(
    value,
    { targetWords, currentWordIndex: currentWordIndex ?? 0 },
    wordResults,
    map,
    getImeOptions(),
  );
  const newWordResults: WordResult[] = wordResults;
  let nextWordIndex = currentWordIndex ?? 0;

  for (const update of result.wordResultUpdates) {
    const { index, result } = update;

    if (newWordResults[index]) {
      newWordResults[index] = result;
    }
  }

  if (result.nextWordIndex) {
    nextWordIndex = result.nextWordIndex;
  }

  return {
    newWordResults,
    typeCountDelta: result.typeCountDelta,
    typeCountStatsDelta: result.typeCountStatsDelta,
    nextWordIndex,
    appendNotifications: result.notificationsToAppend,
  };
};

const textareaPlaceholder = ({
  scene,
  textareaPlaceholderType,
  t,
}: {
  scene: SceneType;
  textareaPlaceholderType: PlaceholderType;
  t: ReturnType<typeof useTranslations<"ime.placeholder">>;
}) => {
  if (scene === "ready") {
    return t("ready");
  }

  if (textareaPlaceholderType === "skip") {
    return t("skip");
  }

  if (textareaPlaceholderType === "end") {
    return t("end");
  }

  if (scene === "end") {
    return t("finished");
  }

  return t("default");
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
