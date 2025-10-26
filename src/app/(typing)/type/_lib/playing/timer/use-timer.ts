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
  useSetActiveSkipGuideKey,
  useSetChangeCSSCount,
  useSetCurrentLine,
  useSetElapsedSecTime,
  useSetLineKpm,
  useSetLineRemainTime,
  useSetNextLyrics,
  useSetTypingStatus,
} from "@/app/(typing)/type/_lib/atoms/state-atoms";
import type { LineData } from "../../type";
import { useGetYouTubeTime } from "../../youtube-player/use-get-youtube-time";
import { useOnEnd } from "../../youtube-player/use-youtube-events";
import { useCalcTypeSpeed } from "../use-calc-type-speed";
import { useGetLineCountByTime } from "../use-get-line-count-by-time";
import { useUpdateLineResult } from "../use-update-line-result";
import { useLineUpdateStatus, useUpdateAllStatus } from "../use-update-status";
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
  const setupNextLine = useSetupNextLine();
  const calcLineResult = useProcessLineCompletion();
  const replay = useReplay();
  const getSeekLineCount = useGetLineCountByTime();

  const getYouTubeTime = useGetYouTubeTime();
  const calcTypeSpeed = useCalcTypeSpeed();

  const { setLineProgressValue, setTotalProgressValue } = useProgress();
  const { readYTStatus } = useReadYTStatus();
  const readElapsedSecTime = useReadElapsedSecTime();
  const readLineWord = useReadLineWord();
  const { readLineStatus } = useLineStatus();
  const readGameStateUtils = useReadGameUtilParams();
  const readMap = useReadMap();
  const { readCount } = useLineCount();
  const { readPlayer } = usePlayer();
  const onEnd = useOnEnd();
  const lastUpdateTimeRef = useRef(0);

  const proceedToNextLine = ({
    currentTime,
    constantLineTime,
    nextLine,
    prevCount,
  }: {
    currentTime: number;
    constantLineTime: number;
    nextLine: LineData;
    prevCount: number;
  }) => {
    const { scene } = readGameStateUtils();
    const { isCompleted } = readLineStatus();

    if (!isCompleted && scene !== "replay") {
      calcLineResult({ constantLineTime, count: prevCount });
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
      const nextCount = scene === "play" ? prevCount + 1 : getSeekLineCount(currentTime);
      setupNextLine(nextCount);
    }
  };

  const updateEvery100ms = ({
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
    setDisplayRemainTime(constantRemainLineTime);

    const { isCompleted } = readLineStatus();

    if (!isCompleted) {
      calcTypeSpeed({ updateType: "timer", constantLineTime });
    }

    displaySkipGuide({
      kana: readLineWord().nextChar.k,
      currentTime,
      constantLineTime,
      constantRemainLineTime,
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
    const nextLine = map.mapData[count + 1];
    const nextLineTime = nextLine.time > movieDuration ? movieDuration : nextLine.time;

    const hasReachedNextLineTime = currentTime >= nextLineTime;
    const isVideoEnded = readPlayer().getPlayerState() === YT.PlayerState.ENDED;
    if (hasReachedNextLineTime || isVideoEnded) {
      proceedToNextLine({ currentTime, constantLineTime, nextLine, prevCount: count });
      return;
    }

    const shouldUpdate100ms = Math.abs(constantTime - lastUpdateTimeRef.current) >= 0.1;
    if (shouldUpdate100ms) {
      updateEvery100ms({ currentTime, constantTime, constantLineTime, constantRemainLineTime });
      lastUpdateTimeRef.current = constantTime;
    }

    setLineProgressValue(currentLineTime);
    const { scene } = readGameStateUtils();

    if (scene === "replay") {
      replay({ constantLineTime, constantRemainLineTime });
    }
  };
};

const useProcessLineCompletion = () => {
  const calcTypeSpeed = useCalcTypeSpeed();
  const updateAllStatus = useUpdateAllStatus();
  const readGameUtilParams = useReadGameUtilParams();
  const readMap = useReadMap();
  const { hasLineResultImproved, saveLineResult } = useUpdateLineResult();
  const updateStatus = useLineUpdateStatus();

  return ({ constantLineTime, count }: { constantLineTime: number; count: number }) => {
    const map = readMap();
    if (!map) return;
    const { scene } = readGameUtilParams();

    const isTypingLine = count >= 0 && map.mapData[count].kpm.r > 0;

    if (isTypingLine) {
      calcTypeSpeed({ updateType: "lineUpdate", constantLineTime });
    }

    if (hasLineResultImproved(count)) {
      saveLineResult(count);
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
  };
};

export const useSetupNextLine = () => {
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
  const { writeCount } = useLineCount();

  return (nextCount: number) => {
    const map = readMap();
    if (!map) return;
    writeCount(nextCount);
    const newCurrentCount = nextCount;

    const newCurrentLine = map.mapData[newCurrentCount];
    const newNextLine = map.mapData[newCurrentCount + 1];
    setCurrentLine({ newCurrentLine, newNextLine });
    resetLineStatus();

    const { inputMode, scene } = readGameStateUtils();
    const { playSpeed } = readPlaySpeed();
    if (scene === "replay") {
      lineReplayUpdate(newCurrentCount);
      updateAllStatus({ count: newCurrentCount, updateType: "lineUpdate" });
    }

    writeLineStatus({ startSpeed: playSpeed, startInputMode: inputMode });
    setTypingStatus((prev) => ({ ...prev, point: 0, timeBonus: 0 }));
    setLineKpm(0);

    setNextLyrics(newNextLine);

    setChangeCSSCount({ newCurrentCount });
  };
};

interface useDisplaySkipGuideProps {
  kana: string;
  currentTime: number;
  constantLineTime: number;
  constantRemainLineTime: number;
}

const useDisplaySkipGuide = () => {
  const readMap = useReadMap();
  const setSkip = useSetActiveSkipGuideKey();
  const { readGameUtilRefParams, writeGameUtilRefParams } = useGameUtilityReferenceParams();
  const readPlaySpeed = useReadPlaySpeed();

  const SKIP_IN = 0.4; //ラインが切り替わり後、指定のtimeが経過したら表示
  const SKIP_OUT = 4; //ラインの残り時間が指定のtimeを切ったら非表示
  const SKIP_KEY = "Space" as const;

  return ({
    kana,
    currentTime,
    constantLineTime: lineConstantTime,
    constantRemainLineTime: lineRemainTime,
  }: useDisplaySkipGuideProps) => {
    const map = readMap();
    if (!map) return;
    const { isRetrySkip } = readGameUtilRefParams();
    const { playSpeed } = readPlaySpeed();

    if (isRetrySkip && currentTime >= map.mapData[map.startLine].time - 3 * playSpeed) {
      writeGameUtilRefParams({ isRetrySkip: false });
    }

    const IS_SKIP_DISPLAY = (!kana && lineConstantTime >= SKIP_IN && lineRemainTime >= SKIP_OUT) || isRetrySkip;

    if (IS_SKIP_DISPLAY) {
      setSkip(SKIP_KEY);
    } else {
      setSkip(null);
    }
  };
};
