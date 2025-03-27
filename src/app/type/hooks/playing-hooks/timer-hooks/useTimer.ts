import {
  useCountRef,
  useGameUtilsRef,
  useLineStatusRef,
  usePlayer,
  useProgress,
  useYTStatusRef,
} from "@/app/type/atoms/refAtoms";
import { usePlaySpeedStateRef } from "@/app/type/atoms/speedReducerAtoms";
import {
  useCurrentTimeStateRef,
  useGameStateUtilsRef,
  useLineWordStateRef,
  useMapStateRef,
  useSetChangeCSSCountState,
  useSetCurrentTimeState,
  useSetLineKpmState,
  useSetLineRemainTimeState,
  useSetLineWordState,
  useSetLyricsState,
  useSetNextLyricsState,
} from "@/app/type/atoms/stateAtoms";
import { useDisplaySkipGuide } from "@/app/type/hooks/playing-hooks/timer-hooks/useDisplaySkipGuide";
import { Ticker } from "pixi.js";
import { LineData } from "../../../ts/type";
import { useCalcTypeSpeed } from "../../calcTypeSpeed";
import { useGetTime } from "../../useGetTime";
import { useUpdateLineResult } from "../updateLineResult";
import { useLineUpdateStatus, useUpdateAllStatus } from "../useUpdateStatus";
import { useLineReplayUpdate, useReplay } from "./replayHooks";
import { useGetSeekLineCount } from "./useSeekGetLineCount";

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

export const useTimerControls = () => {
  const startTimer = () => {
    if (!typeTicker.started) {
      typeTicker.start();
    }
  };

  const pauseTimer = () => {
    if (typeTicker.started) {
      typeTicker.stop();
    }
  };

  const setFrameRate = (rate: number) => {
    typeTicker.maxFPS = rate;
    typeTicker.minFPS = rate;
  };

  return { startTimer, pauseTimer, setFrameRate };
};

export const useTimer = () => {
  const { readPlayer } = usePlayer();

  const setCurrentTime = useSetCurrentTimeState();
  const setDisplayRemainTime = useSetLineRemainTimeState();
  const displaySkipGuide = useDisplaySkipGuide();
  const updateLine = useUpdateLine();
  const calcLineResult = useCalcLineResult();
  const replay = useReplay();
  const getSeekLineCount = useGetSeekLineCount();

  const {
    getCurrentOffsettedYTTime,
    getConstantOffsettedYTTime,
    getCurrentLineTime,
    getCurrentLineRemainTime,
    getConstantLineTime,
  } = useGetTime();
  const calcTypeSpeed = useCalcTypeSpeed();

  const { readLineProgress, setTotalProgressValue } = useProgress();
  const { readGameUtils, writeGameUtils } = useGameUtilsRef();
  const { readYTStatus } = useYTStatusRef();
  const readCurrentTime = useCurrentTimeStateRef();
  const readLineWord = useLineWordStateRef();
  const { readLineStatus } = useLineStatusRef();
  const readPlaySpeed = usePlaySpeedStateRef();
  const readGameStateUtils = useGameStateUtilsRef();
  const readMap = useMapStateRef();
  const { readCount, writeCount } = useCountRef();

  const { pauseTimer } = useTimerControls();
  const update = ({
    currentOffesettedYTTime,
    constantLineTime,
    nextLine,
  }: {
    currentOffesettedYTTime: number;
    constantLineTime: number;
    nextLine: LineData;
  }) => {
    calcLineResult({ constantLineTime });

    const movieDuration = readYTStatus().movieDuration;
    if (nextLine?.["lyrics"] === "end" || currentOffesettedYTTime >= movieDuration) {
      readPlayer().stopVideo();
      pauseTimer();
      return;
    }

    if (nextLine) {
      const { scene } = readGameStateUtils();
      if (scene === "playing") {
        writeCount(readCount() + 1);
      } else {
        writeCount(getSeekLineCount(currentOffesettedYTTime));
      }

      updateLine(readCount());
    }
  };

  const updateMs = ({
    constantLineTime,
    constantRemainLineTime,
    currentOffesettedYTTime,
    constantOffesettedYTTime,
  }: {
    constantLineTime: number;
    constantRemainLineTime: number;
    currentOffesettedYTTime: number;
    constantOffesettedYTTime: number;
  }) => {
    setDisplayRemainTime(constantRemainLineTime);

    const { isCompleted } = readLineStatus();
    if (!isCompleted) {
      calcTypeSpeed({
        updateType: "timer",
        constantLineTime,
      });
    }

    const { isRetrySkip } = readGameUtils();
    const map = readMap();
    const { playSpeed } = readPlaySpeed();
    if (isRetrySkip && map.mapData[map.startLine].time - 3 * playSpeed <= currentOffesettedYTTime) {
      writeGameUtils({ isRetrySkip: false });
    }

    displaySkipGuide({
      kana: readLineWord().nextChar["k"],
      lineConstantTime: constantLineTime,
      lineRemainTime: constantRemainLineTime,
      isRetrySkip,
    });

    setTotalProgressValue(currentOffesettedYTTime);
    const currentTime = readCurrentTime();
    if (Math.abs(constantOffesettedYTTime - currentTime) >= 1) {
      setCurrentTime(constantOffesettedYTTime);
    }
  };

  return () => {
    const map = readMap();
    const currentOffesettedYTTime = getCurrentOffsettedYTTime();
    const currentLineTime = getCurrentLineTime(currentOffesettedYTTime);

    const movieDuration = readYTStatus().movieDuration;
    const count = readCount();
    const nextLine = map.mapData[count];
    const nextLineTime = nextLine.time > movieDuration ? movieDuration : nextLine.time;
    const isUpdateLine =
      currentOffesettedYTTime >= nextLineTime || currentOffesettedYTTime >= readYTStatus().movieDuration;

    if (isUpdateLine) {
      const constantLineTime = getConstantLineTime(currentLineTime);
      update({
        currentOffesettedYTTime,
        constantLineTime,
        nextLine,
      });
      return;
    }

    const constantOffesettedYTTime = getConstantOffsettedYTTime(currentOffesettedYTTime);
    const isUpdateMs = Math.abs(constantOffesettedYTTime - readGameUtils().updateMsTimeCount) >= 0.1;

    if (isUpdateMs) {
      const constantRemainLineTime = getCurrentLineRemainTime(currentOffesettedYTTime);
      const constantLineTime = getConstantLineTime(currentLineTime);
      updateMs({
        currentOffesettedYTTime,
        constantOffesettedYTTime,
        constantLineTime,
        constantRemainLineTime,
      });
      writeGameUtils({
        updateMsTimeCount: constantOffesettedYTTime,
      });
    }

    const lineProgress = readLineProgress();
    lineProgress.value =
      currentOffesettedYTTime < 0 ? nextLine.time + currentOffesettedYTTime : currentLineTime;
    const { scene } = readGameStateUtils();

    if (scene === "replay" && count && currentLineTime) {
      const constantLineTime = getConstantLineTime(currentLineTime);
      replay({ constantLineTime });
    }
  };
};

export const useCalcLineResult = () => {
  const calcTypeSpeed = useCalcTypeSpeed();
  const updateAllStatus = useUpdateAllStatus();

  const { readLineStatus } = useLineStatusRef();
  const readGameStateUtils = useGameStateUtilsRef();
  const readMap = useMapStateRef();
  const { readCount } = useCountRef();
  const { isLinePointUpdated, updateLineResult } = useUpdateLineResult();
  const updateStatus = useLineUpdateStatus();

  return ({ constantLineTime }: { constantLineTime: number }) => {
    const map = readMap();
    const { scene } = readGameStateUtils();
    const { isCompleted } = readLineStatus();
    const count = readCount();

    if (!isCompleted && scene !== "replay" && count > 0) {
      const isTypingLine = map.mapData[count - 1].kpm.r > 0;

      if (isTypingLine) {
        calcTypeSpeed({
          updateType: "lineUpdate",
          constantLineTime,
        });
      }

      if (isLinePointUpdated()) {
        updateLineResult();
      }

      if (scene === "playing") {
        updateStatus({ constantLineTime });
      } else if (scene === "practice") {
        updateAllStatus({
          count: map.mapData.length - 1,
          updateType: "lineUpdate",
        });
      }
    } else if (scene === "replay") {
      updateAllStatus({ count, updateType: "lineUpdate" });
    }
  };
};

export const useUpdateLine = () => {
  const setLyrics = useSetLyricsState();
  const { setNextLyrics, resetNextLyrics } = useSetNextLyricsState();
  const setLineWord = useSetLineWordState();
  const setDisplayLineKpm = useSetLineKpmState();
  const setChangeCSSCount = useSetChangeCSSCountState();

  const lineReplayUpdate = useLineReplayUpdate();

  const { readLineProgress } = useProgress();
  const { readYTStatus } = useYTStatusRef();
  const { resetLineStatus, writeLineStatus } = useLineStatusRef();
  const readPlaySpeed = usePlaySpeedStateRef();
  const readMap = useMapStateRef();
  const readGameStateUtils = useGameStateUtilsRef();

  return (newCount: number) => {
    const map = readMap();
    const currentCount = newCount ? newCount - 1 : 0;
    const { inputMode, scene } = readGameStateUtils();
    resetLineStatus();
    const speed = readPlaySpeed();
    writeLineStatus({
      startSpeed: speed.playSpeed,
      startInputMode: inputMode,
    });

    setDisplayLineKpm(0);
    setLineWord({
      correct: { k: "", r: "" },
      nextChar: [...structuredClone(map.mapData[currentCount].word)][0],
      word: [...structuredClone(map.mapData[currentCount].word)].slice(1),
    });

    setLyrics(map.mapData[currentCount]["lyrics"]);

    if (map.mapData[newCount].kanaWord) {
      setNextLyrics(map.mapData[newCount]);
    } else {
      resetNextLyrics();
    }

    if (map.mapChangeCSSCounts.length) {
      const closestMin = map.mapChangeCSSCounts
        .filter((count) => count <= currentCount)
        .reduce((prev, curr) => (prev === undefined || curr > prev ? curr : prev), 0);
      setChangeCSSCount(closestMin);
    }

    const nextTime = Number(map.mapData[newCount]["time"]);
    const movieDuration = readYTStatus().movieDuration;

    const lineProgress = readLineProgress();
    lineProgress.max =
      (nextTime > movieDuration ? movieDuration : nextTime) - Number(map.mapData[currentCount]["time"]);

    if (scene === "replay") {
      lineReplayUpdate(currentCount);
    }
  };
};
