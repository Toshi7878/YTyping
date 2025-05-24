import { Flex, Textarea } from "@chakra-ui/react";
import { Ticker } from "@pixi/ticker";
import { useEffect, useRef } from "react";
import { useInputTextarea, useUserStats } from "../atom/refAtoms";
import {
  useReadGameUtilParams,
  useReadMap,
  useResultDialogDisclosure,
  useSceneState,
  useTextareaPlaceholderTypeState,
} from "../atom/stateAtoms";
import { useJudgeTargetWords } from "../hooks/judgeTargetWords";
import useSceneControl from "../hooks/sceneControl";
import { useSkip } from "../hooks/skip";
import { PlaceholderType, SceneType } from "../type";

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

      switch (value.toLowerCase()) {
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
    <Flex bg="background.card" fontSize="3xl" width="85%" alignItems="center" justifyContent="center" mx="auto">
      <Textarea
        ref={lyricsTextareaRef}
        px={4}
        height="130px"
        color="white"
        autoComplete="off"
        resize="none"
        fontSize="90%"
        borderRadius="md"
        fontWeight="bold"
        letterSpacing={1.5}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
      />
    </Flex>
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
