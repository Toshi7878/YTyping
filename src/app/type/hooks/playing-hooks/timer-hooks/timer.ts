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
  useSetCurrentLineState,
  useSetCurrentTimeState,
  useSetLineKpmState,
  useSetLineRemainTimeState,
  useSetNextLyricsState,
  useSetTypingStatusState,
} from "@/app/type/atoms/stateAtoms";
import { useDisplaySkipGuide } from "@/app/type/hooks/playing-hooks/timer-hooks/displaySkipGuide";
import { Ticker } from "pixi.js";
import { LineData } from "../../../ts/type";
import { useCalcTypeSpeed } from "../calcTypeSpeed";
import { useGetTime } from "../getYTTime";
import { useUpdateLineResult } from "../updateLineResult";
import { useLineUpdateStatus, useUpdateAllStatus } from "../updateStatus";
import { useGetSeekLineCount } from "./getLineCountByTime";
import { useLineReplayUpdate, useReplay } from "./replay";

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

const useTimer = () => {
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

  const { setLineProgressValue, setTotalProgressValue } = useProgress();
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
    const { scene } = readGameStateUtils();

    if (scene !== "replay") {
      calcLineResult({ constantLineTime });
    }

    const { movieDuration } = readYTStatus();
    if (nextLine?.["lyrics"] === "end" || currentOffesettedYTTime >= movieDuration) {
      readPlayer().stopVideo();
      pauseTimer();
      return;
    }

    if (nextLine) {
      if (scene === "play") {
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

    setLineProgressValue(currentOffesettedYTTime < 0 ? nextLine.time + currentOffesettedYTTime : currentLineTime);
    const { scene } = readGameStateUtils();

    if (scene === "replay" && count && currentLineTime) {
      const constantLineTime = getConstantLineTime(currentLineTime);
      replay({ constantLineTime });
    }
  };
};

const useCalcLineResult = () => {
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

    if (!isCompleted && count > 0) {
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

      switch (scene) {
        case "play":
          updateStatus({ constantLineTime });
          break;
        case "practice":
          updateAllStatus({
            count: map.mapData.length - 1,
            updateType: "lineUpdate",
          });
          break;
      }
    }
  };
};

export const useUpdateLine = () => {
  const { setNextLyrics, resetNextLyrics } = useSetNextLyricsState();
  const setLineKpm = useSetLineKpmState();
  const setChangeCSSCount = useSetChangeCSSCountState();

  const lineReplayUpdate = useLineReplayUpdate();
  const { resetLineStatus, writeLineStatus } = useLineStatusRef();
  const { setTypingStatus } = useSetTypingStatusState();
  const { setCurrentLine } = useSetCurrentLineState();
  const readPlaySpeed = usePlaySpeedStateRef();
  const readMap = useMapStateRef();
  const readGameStateUtils = useGameStateUtilsRef();
  const updateAllStatus = useUpdateAllStatus();

  return (newNextCount: number) => {
    const map = readMap();
    const newCurrentCount = newNextCount ? newNextCount - 1 : 0;
    const { inputMode, scene } = readGameStateUtils();
    const newCurrentLine = map.mapData[newCurrentCount];
    const newNextLine = map.mapData[newNextCount];
    setCurrentLine({ newCurrentLine, newNextLine });

    resetLineStatus();
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

    if (newNextLine.kanaWord) {
      setNextLyrics(newNextLine);
    } else {
      resetNextLyrics();
    }

    setChangeCSSCount({ newCurrentCount: newCurrentCount });
  };
};
