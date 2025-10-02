import { Ticker } from "@pixi/ticker";
import { useRef } from "react";
import {
  useGameUtilityReferenceParams,
  useLineCount,
  useLineStatus,
  usePlayer,
  useProgress,
  useReadYTStatus,
} from "@/app/(typing)/type/_lib/atoms/read-atoms";
import { useReadPlaySpeed } from "@/app/(typing)/type/_lib/atoms/speed-reducer-atoms";
import {
  useReadElapsedSecTime,
  useReadGameUtilParams,
  useReadLineWord,
  useReadMap,
  useSetChangeCSSCount,
  useSetCurrentLine,
  useSetElapsedSecTime,
  useSetLineKpm,
  useSetLineRemainTime,
  useSetNextLyrics,
  useSetTypingStatus,
} from "@/app/(typing)/type/_lib/atoms/state-atoms";
import { useDisplaySkipGuide } from "@/app/(typing)/type/_lib/playing/timer/use-display-skip-guide";
import type { LineData } from "../../type";
import { useGetYouTubeTime } from "../../youtube-player/use-get-youtube-time";
import { useOnEnd } from "../../youtube-player/use-youtube-events";
import { useCalcTypeSpeed } from "../use-calc-type-speed";
import { useUpdateLineResult } from "../use-update-line-result";
import { useLineUpdateStatus, useUpdateAllStatus } from "../use-update-status";
import { useGetLineCountByTime } from "./use-get-line-count-by-time";
import { useLineReplayUpdate, useReplay } from "./use-replay";

const typeTicker = new Ticker();

export const useTimerRegistration = () => {
  const playTimer = useTimer();

  const addTimer = () => {
    typeTicker.add(playTimer);
  };

  const removeTimer = () => {
    typeTicker.stop();
    typeTicker.remove(playTimer);
  };

  return { addTimer, removeTimer };
};

export const timerControls = {
  startTimer: () => {
    if (!typeTicker.started) {
      typeTicker.start();
      console.log("startTimer");
    }
  },
  stopTimer: () => {
    if (typeTicker.started) {
      typeTicker.stop();
      console.log("stopTimer");
    }
  },
  setFrameRate: (rate: number) => {
    typeTicker.maxFPS = rate;
    typeTicker.minFPS = rate;
  },
};

const useTimer = () => {
  const setElapsedSecTime = useSetElapsedSecTime();
  const setDisplayRemainTime = useSetLineRemainTime();
  const displaySkipGuide = useDisplaySkipGuide();
  const updateLine = useUpdateLine();
  const calcLineResult = useCalcLineResult();
  const replay = useReplay();
  const getSeekLineCount = useGetLineCountByTime();

  const getYouTubeTime = useGetYouTubeTime();
  const calcTypeSpeed = useCalcTypeSpeed();

  const { setLineProgressValue, setTotalProgressValue } = useProgress();
  const { readGameUtilRefParams, writeGameUtilRefParams } = useGameUtilityReferenceParams();
  const { readYTStatus } = useReadYTStatus();
  const readElapsedSecTime = useReadElapsedSecTime();
  const readLineWord = useReadLineWord();
  const { readLineStatus } = useLineStatus();
  const readPlaySpeed = useReadPlaySpeed();
  const readGameStateUtils = useReadGameUtilParams();
  const readMap = useReadMap();
  const { readCount, writeCount } = useLineCount();
  const { readPlayer } = usePlayer();
  const onEnd = useOnEnd();
  const msTimeCountRef = useRef(0);

  const update = ({
    currentTime,
    constantLineTime,
    nextLine,
  }: {
    currentTime: number;
    constantLineTime: number;
    nextLine: LineData;
  }) => {
    const { scene } = readGameStateUtils();

    if (scene !== "replay") {
      calcLineResult({ constantLineTime });
    }

    const { movieDuration } = readYTStatus();

    const isEnd =
      nextLine?.lyrics === "end" ||
      currentTime >= movieDuration ||
      readPlayer().getPlayerState() === YT.PlayerState.ENDED;

    if (isEnd) {
      onEnd();
      timerControls.stopTimer();
      const player = readPlayer();
      player.stopVideo();
      player.cueVideoById(player.getVideoData().video_id);
      return;
    }

    if (nextLine) {
      if (scene === "play") {
        writeCount(readCount() + 1);
      } else {
        writeCount(getSeekLineCount(currentTime));
      }

      updateLine(readCount());
    }
  };

  const updateMs = ({
    currentTime,
    constantLineTime,
    constantRemainLineTime,
    constantTime,
  }: {
    currentTime: number;
    constantTime: number;
    constantLineTime: number;
    constantRemainLineTime: number;
  }) => {
    const map = readMap();
    if (!map) return;

    setDisplayRemainTime(constantRemainLineTime);

    const { isCompleted } = readLineStatus();

    if (!isCompleted) {
      calcTypeSpeed({ updateType: "timer", constantLineTime });
    }

    const { isRetrySkip } = readGameUtilRefParams();
    const { playSpeed } = readPlaySpeed();
    if (isRetrySkip && map.mapData[map.startLine].time - 3 * playSpeed <= currentTime) {
      writeGameUtilRefParams({ isRetrySkip: false });
    }

    displaySkipGuide({
      kana: readLineWord().nextChar.k,
      lineConstantTime: constantLineTime,
      lineRemainTime: constantRemainLineTime,
      isRetrySkip,
    });

    setTotalProgressValue(currentTime);
    const elapsedSecTime = readElapsedSecTime();
    if (Math.abs(constantTime - elapsedSecTime) >= 1) {
      setElapsedSecTime(constantTime);
    }
  };

  return () => {
    const map = readMap();
    if (!map) return;

    const { currentTime, constantTime, currentLineTime, constantLineTime, constantRemainLineTime } = getYouTubeTime({
      type: "remainLineTime",
    });

    const { movieDuration } = readYTStatus();
    const count = readCount();
    const nextLine = map.mapData[count];
    const nextLineTime = nextLine.time > movieDuration ? movieDuration : nextLine.time;
    const isUpdateLine = currentTime >= nextLineTime || readPlayer().getPlayerState() === YT.PlayerState.ENDED;

    if (isUpdateLine) {
      update({ currentTime, constantLineTime, nextLine });
      return;
    }

    const isUpdateMs = Math.abs(constantTime - msTimeCountRef.current) >= 0.1;

    if (isUpdateMs) {
      updateMs({ currentTime, constantTime, constantLineTime, constantRemainLineTime });
      msTimeCountRef.current = constantTime;
    }

    setLineProgressValue(currentLineTime);
    const { scene } = readGameStateUtils();

    if (scene === "replay" && count && currentLineTime) {
      replay({ constantLineTime, constantRemainLineTime });
    }
  };
};

const useCalcLineResult = () => {
  const calcTypeSpeed = useCalcTypeSpeed();
  const updateAllStatus = useUpdateAllStatus();

  const { readLineStatus } = useLineStatus();
  const readGameStateUtils = useReadGameUtilParams();
  const readMap = useReadMap();
  const { readCount } = useLineCount();
  const { isLinePointUpdated, updateLineResult } = useUpdateLineResult();
  const updateStatus = useLineUpdateStatus();

  return ({ constantLineTime }: { constantLineTime: number }) => {
    const map = readMap();
    if (!map) return;
    const { scene } = readGameStateUtils();
    const { isCompleted } = readLineStatus();
    const count = readCount();

    if (!isCompleted && count > 0) {
      const isTypingLine = map.mapData[count - 1].kpm.r > 0;

      if (isTypingLine) {
        calcTypeSpeed({ updateType: "lineUpdate", constantLineTime });
      }

      if (isLinePointUpdated()) {
        updateLineResult();
      }

      switch (scene) {
        case "play":
        case "play_end":
          updateStatus({ constantLineTime });
          break;
        case "practice":
          updateAllStatus({ count: map.mapData.length - 1, updateType: "lineUpdate" });
          break;
      }
    }
  };
};

export const useUpdateLine = () => {
  const { setNextLyrics } = useSetNextLyrics();
  const setLineKpm = useSetLineKpm();
  const setChangeCSSCount = useSetChangeCSSCount();

  const lineReplayUpdate = useLineReplayUpdate();
  const { resetLineStatus, writeLineStatus } = useLineStatus();
  const { setTypingStatus } = useSetTypingStatus();
  const { setCurrentLine } = useSetCurrentLine();
  const readPlaySpeed = useReadPlaySpeed();
  const readMap = useReadMap();
  const readGameStateUtils = useReadGameUtilParams();
  const updateAllStatus = useUpdateAllStatus();

  return (newNextCount: number) => {
    const map = readMap();
    if (!map) return;
    const newCurrentCount = newNextCount ? newNextCount - 1 : 0;

    const newCurrentLine = map.mapData[newCurrentCount];
    const newNextLine = map.mapData[newNextCount];
    setCurrentLine({ newCurrentLine, newNextLine });
    resetLineStatus();

    const { inputMode, scene } = readGameStateUtils();
    const { playSpeed } = readPlaySpeed();
    if (scene === "replay") {
      lineReplayUpdate(newCurrentCount);
      updateAllStatus({ count: newCurrentCount, updateType: "lineUpdate" });
    }

    writeLineStatus({
      startSpeed: playSpeed,
      startInputMode: inputMode,
    });

    setTypingStatus((prev) => ({
      ...prev,
      point: 0,
      timeBonus: 0,
    }));

    setLineKpm(0);

    setNextLyrics(newNextLine);

    setChangeCSSCount({ newCurrentCount });
  };
};
