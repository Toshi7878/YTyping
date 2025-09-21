import {
  useGameUtilityReferenceParams,
  useLineCount,
  useLineStatus,
  usePlayer,
  useProgress,
  useReadYTStatus,
} from "@/app/(typing)/type/_lib/atoms/refAtoms";
import { useReadPlaySpeed } from "@/app/(typing)/type/_lib/atoms/speedReducerAtoms";
import {
  useReadCurrentTime,
  useReadGameUtilParams,
  useReadLineWord,
  useReadMap,
  useSetChangeCSSCount,
  useSetCurrentLine,
  useSetCurrentTime,
  useSetLineKpm,
  useSetLineRemainTime,
  useSetNextLyrics,
  useSetTypingStatus,
} from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { useDisplaySkipGuide } from "@/app/(typing)/type/_lib/hooks/playing/timer/displaySkipGuide";
import { Ticker } from "@pixi/ticker";
import type { LineData } from "../../../type";
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

  const setCurrentTime = useSetCurrentTime();
  const setDisplayRemainTime = useSetLineRemainTime();
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
  const { readGameUtilRefParams, writeGameUtilRefParams } = useGameUtilityReferenceParams();
  const { readYTStatus } = useReadYTStatus();
  const readCurrentTime = useReadCurrentTime();
  const readLineWord = useReadLineWord();
  const { readLineStatus } = useLineStatus();
  const readPlaySpeed = useReadPlaySpeed();
  const readGameStateUtils = useReadGameUtilParams();
  const readMap = useReadMap();
  const { readCount, writeCount } = useLineCount();

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
    const map = readMap();
    if (!map) return;

    setDisplayRemainTime(constantRemainLineTime);

    const { isCompleted } = readLineStatus();

    if (!isCompleted) {
      calcTypeSpeed({
        updateType: "timer",
        constantLineTime,
      });
    }

    const { isRetrySkip } = readGameUtilRefParams();
    const { playSpeed } = readPlaySpeed();
    if (isRetrySkip && map.mapData[map.startLine].time - 3 * playSpeed <= currentOffesettedYTTime) {
      writeGameUtilRefParams({ isRetrySkip: false });
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
    if (!map) return;

    const currentOffesettedYTTime = getCurrentOffsettedYTTime();
    const currentLineTime = getCurrentLineTime(currentOffesettedYTTime);

    const { movieDuration } = readYTStatus();
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
    const isUpdateMs = Math.abs(constantOffesettedYTTime - readGameUtilRefParams().updateMsTimeCount) >= 0.1;

    if (isUpdateMs) {
      const constantRemainLineTime = getCurrentLineRemainTime(currentOffesettedYTTime);
      const constantLineTime = getConstantLineTime(currentLineTime);
      updateMs({
        currentOffesettedYTTime,
        constantOffesettedYTTime,
        constantLineTime,
        constantRemainLineTime,
      });
      writeGameUtilRefParams({
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
