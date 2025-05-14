import { Ticker } from "pixi.js";
import {
  useGameUtilityReferenceParams,
  useLineCount,
  useLineStatus,
  usePlayer,
  useProgress,
  useYTStatus,
} from "../atom/refAtoms";
import { usePlaySpeedStateRef } from "../atom/speedReducerAtoms";
import {
  useReadCurrentTime,
  useReadGameUtilParams,
  useReadMapState,
  useSetCurrentTime,
  useSetLineRemainTime,
} from "../atom/stateAtoms";

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

  const { setLineProgressValue, setTotalProgressValue } = useProgress();
  const { readGameUtilRefParams, writeGameUtilRefParams } = useGameUtilityReferenceParams();
  const { readYTStatus } = useYTStatus();
  const readCurrentTime = useReadCurrentTime();
  const { readLineStatus } = useLineStatus();
  const readPlaySpeed = usePlaySpeedStateRef();
  const readGameStateUtils = useReadGameUtilParams();
  const readMap = useReadMapState();
  const { readCount, writeCount } = useLineCount();

  const { pauseTimer } = useTimerControls();
  const update = () => {};

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
  }) => {};

  return () => {};
};
