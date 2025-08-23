import { Textarea } from "@/components/ui/textarea";
import { Ticker } from "@pixi/ticker";
import { useEffect, useRef } from "react";
import { useInputTextarea, useUserStats } from "../_lib/atoms/refAtoms";
import {
  useReadGameUtilParams,
  useReadMap,
  useResultDialogDisclosure,
  useSceneState,
  useTextareaPlaceholderTypeState,
} from "../_lib/atoms/stateAtoms";
import { useJudgeTargetWords } from "../_lib/hooks/judgeTargetWords";
import useSceneControl from "../_lib/hooks/sceneControl";
import { useSkip } from "../_lib/hooks/skip";
import { PlaceholderType, SceneType } from "../_lib/type";

const TICK_STOP_TIME = 1000;

const InputTextarea = () => {
  const judgeTargetWords = useJudgeTargetWords();
  const handleSkip = useSkip();
  const { handleEnd } = useSceneControl();
  const { readGameUtilParams } = useReadGameUtilParams();
  const readMap = useReadMap();
  const textareaPlaceholderType = useTextareaPlaceholderTypeState();
  const scene = useSceneState();

  const placeholder = usePlaceholder({ scene, textareaPlaceholderType });

  const { startTicker, stopTicker, tickerRef, tickStartRef } = useTypingTimeTimer();
  const { onOpen } = useResultDialogDisclosure();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
      const value = e.currentTarget.value;
      e.preventDefault();
      judgeTargetWords(value);
      stopTicker();

      switch (value.toLowerCase().trim()) {
        case "skip":
          const { skipRemainTime } = readGameUtilParams();
          if (skipRemainTime !== null) {
            handleSkip();
          }
          break;
        case "end":
          const map = readMap();
          const { count } = readGameUtilParams();
          if (!map.lines[count]) {
            handleEnd();
          }
          break;
        case "result":
          if (scene === "end") {
            onOpen();
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
  const { writeInputTextarea: writeLyricsTextarea } = useInputTextarea();

  useEffect(() => {
    if (lyricsTextareaRef.current) {
      writeLyricsTextarea(lyricsTextareaRef.current);
    }
  }, [writeLyricsTextarea]);

  return (
    <div className="z-2 mx-auto flex w-[95%] items-center justify-center md:w-[85%]">
      <Textarea
        ref={lyricsTextareaRef}
        className="h-[130px] resize-none rounded-md px-4 text-2xl font-bold tracking-widest xl:text-3xl"
        autoComplete="off"
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
      />
    </div>
  );
};

const usePlaceholder = ({
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
  const { incrementTypingTime } = useUserStats();

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
      incrementTypingTime(elapsedRef.current);
      elapsedRef.current = 0;
    }
  };

  return { startTicker, stopTicker, tickerRef, tickStartRef };
};

export default InputTextarea;
