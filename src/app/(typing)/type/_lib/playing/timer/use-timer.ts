import { Ticker } from "@pixi/ticker";
import { useRef } from "react";
import {
  readLineCount,
  readLineSubstatus,
  readUtilityRefParams,
  readYTPlayer,
  resetLineSubstatus,
  setLineProgressValue,
  setTotalProgressValue,
  writeLineCount,
  writeLineSubstatus,
  writeUtilityRefParams,
} from "@/app/(typing)/type/_lib/atoms/ref";
import { readPlaySpeed } from "@/app/(typing)/type/_lib/atoms/speed-reducer";
import {
  readBuiltMap,
  readElapsedSecTime,
  readLineWord,
  readUtilityParams,
  setActiveSkipGuideKey,
  setChangeCSSCount,
  setElapsedSecTime,
  setLineKpm,
  setLineRemainTime,
  setNewLine,
  setNextLyrics,
  setTypingStatus,
} from "@/app/(typing)/type/_lib/atoms/state";
import type { BuiltMapLine } from "../../type";
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
  const displaySkipGuide = useDisplaySkipGuide();
  const setupNextLine = useSetupNextLine();
  const calcLineResult = useProcessLineCompletion();
  const replay = useReplay();
  const getSeekLineCount = useGetLineCountByTime();

  const getYouTubeTime = useGetYouTubeTime();
  const calcTypeSpeed = useCalcTypeSpeed();

  const onEnd = useOnEnd();
  const lastUpdateTimeRef = useRef(0);

  const proceedToNextLine = ({
    currentTime,
    constantLineTime,
    nextLine,
    prevCount,
    isVideoEnded,
  }: {
    currentTime: number;
    constantLineTime: number;
    nextLine: BuiltMapLine | undefined;
    prevCount: number;
    isVideoEnded: boolean;
  }) => {
    const { scene, movieDuration } = readUtilityParams();
    const { isCompleted } = readLineSubstatus();

    if (!isCompleted && scene !== "replay") {
      calcLineResult({ constantLineTime, count: prevCount });
    }

    const isEnd = nextLine?.lyrics === "end" || currentTime >= movieDuration || isVideoEnded;

    if (isEnd) {
      onEnd();
      timerControls.stopTimer();
      const YTPlayer = readYTPlayer();
      YTPlayer?.stopVideo();
      YTPlayer?.cueVideoById(YTPlayer.getVideoData().video_id);
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
    setLineRemainTime(constantRemainLineTime);

    const { isCompleted } = readLineSubstatus();

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
    const map = readBuiltMap();
    if (!map) return;

    const { currentTime, constantTime, currentLineTime, constantLineTime, constantRemainLineTime } = getYouTubeTime({
      type: "remainLineTime",
    });
    const { movieDuration } = readUtilityParams();

    const count = readLineCount();
    const nextLine = map.mapData[count + 1];
    const nextLineTime = nextLine && movieDuration > nextLine.time ? nextLine.time : movieDuration;

    const hasReachedNextLineTime = currentTime >= nextLineTime;
    const YTPlayer = readYTPlayer();
    const isVideoEnded = YTPlayer?.getPlayerState() === YT.PlayerState.ENDED;
    if (hasReachedNextLineTime || isVideoEnded) {
      proceedToNextLine({ currentTime, constantLineTime, nextLine, prevCount: count, isVideoEnded });
      return;
    }

    const shouldUpdate100ms = Math.abs(constantTime - lastUpdateTimeRef.current) >= 0.1;
    if (shouldUpdate100ms) {
      updateEvery100ms({ currentTime, constantTime, constantLineTime, constantRemainLineTime });
      lastUpdateTimeRef.current = constantTime;
    }

    setLineProgressValue(currentLineTime);
    const { scene } = readUtilityParams();

    if (scene === "replay") {
      replay({ constantLineTime, constantRemainLineTime });
    }
  };
};

const useProcessLineCompletion = () => {
  const calcTypeSpeed = useCalcTypeSpeed();
  const updateAllStatus = useUpdateAllStatus();
  const { hasLineResultImproved, saveLineResult } = useUpdateLineResult();
  const updateStatus = useLineUpdateStatus();

  return ({ constantLineTime, count }: { constantLineTime: number; count: number }) => {
    const map = readBuiltMap();
    const currentLine = map?.mapData[count];
    if (!map || !currentLine) return;

    const isTypingLine = count >= 0 && currentLine.kpm.r > 0;
    const { scene } = readUtilityParams();

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
  const lineReplayUpdate = useLineReplayUpdate();
  const updateAllStatus = useUpdateAllStatus();

  return (nextCount: number) => {
    const map = readBuiltMap();
    const newCurrentLine = map?.mapData[nextCount];
    const newNextLine = map?.mapData[nextCount + 1];
    if (!map || !newCurrentLine || !newNextLine) return;

    writeLineCount(nextCount);
    setNewLine({ newCurrentLine, newNextLine });
    resetLineSubstatus();

    const { inputMode, scene } = readUtilityParams();
    const { playSpeed } = readPlaySpeed();

    if (scene === "replay") {
      lineReplayUpdate(nextCount);
      updateAllStatus({ count: nextCount, updateType: "lineUpdate" });
    }

    writeLineSubstatus({ startSpeed: playSpeed, startInputMode: inputMode });
    setTypingStatus((prev) => ({ ...prev, point: 0, timeBonus: 0 }));
    setLineKpm(0);

    setNextLyrics(newNextLine);

    setChangeCSSCount(nextCount);
  };
};

interface useDisplaySkipGuideProps {
  kana: string;
  currentTime: number;
  constantLineTime: number;
  constantRemainLineTime: number;
}

const useDisplaySkipGuide = () => {
  const SKIP_IN = 0.4; //ラインが切り替わり後、指定のtimeが経過したら表示
  const SKIP_OUT = 4; //ラインの残り時間が指定のtimeを切ったら非表示
  const SKIP_KEY = "Space" as const;

  return ({
    kana,
    currentTime,
    constantLineTime: lineConstantTime,
    constantRemainLineTime: lineRemainTime,
  }: useDisplaySkipGuideProps) => {
    const map = readBuiltMap();
    if (!map) return;
    const { isRetrySkip } = readUtilityRefParams();
    const { playSpeed } = readPlaySpeed();
    const startLine = map.mapData[map.startLine];

    if (isRetrySkip && startLine && currentTime >= startLine.time - 3 * playSpeed) {
      writeUtilityRefParams({ isRetrySkip: false });
    }

    const IS_SKIP_DISPLAY = (!kana && lineConstantTime >= SKIP_IN && lineRemainTime >= SKIP_OUT) || isRetrySkip;

    if (IS_SKIP_DISPLAY) {
      setActiveSkipGuideKey(SKIP_KEY);
    } else {
      setActiveSkipGuideKey(null);
    }
  };
};
