import {
  useGameUtilsRef,
  useLineStatusRef,
  usePlayer,
  useProgress,
  useStatusRef,
  useUserStatsRef,
  useYTStatusRef,
} from "@/app/type/atoms/refAtoms";
import { usePlaySpeedStateRef } from "@/app/type/atoms/speedReducerAtoms";
import {
  useComboStateRef,
  useCurrentTimeStateRef,
  useLineResultsStateRef,
  useLineWordStateRef,
  useMapStateRef,
  usePlayingInputModeStateRef,
  useSceneStateRef,
  useSetChangeCSSCountState,
  useSetComboState,
  useSetCurrentTimeState,
  useSetLineKpmState,
  useSetLineRemainTimeState,
  useSetLineResultsState,
  useSetLineWordState,
  useSetLyricsState,
  useSetNextLyricsState,
  useSetTypingStatusState,
  useTypingStatusStateRef,
  useUserTypingOptionsStateRef,
} from "@/app/type/atoms/stateAtoms";
import { useDisplaySkipGuide } from "@/app/type/hooks/playing-hooks/timer-hooks/useDisplaySkipGuide";
import { Ticker } from "pixi.js";
import { useEffect } from "react";
import { MISS_PENALTY } from "../../../../../lib/instanceMapData";
import { LineData } from "../../../ts/type";
import { useCalcTypeSpeed } from "../../calcTypeSpeed";
import { useGetTime } from "../../useGetTime";
import { useOutPutLineResult } from "../useOutPutLineResult";
import { useLineReplayUpdate, useReplay, useUpdateAllStatus } from "./replayHooks";
import { useGetSeekLineCount } from "./useSeekGetLineCount";

const typeTicker = new Ticker();
export const useTimerControls = () => {
  const playTimer = useTimer();
  useEffect(() => {
    typeTicker.add(playTimer);

    return () => {
      typeTicker.stop();
      typeTicker.remove(playTimer);
    };
  }, [typeTicker]);

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
    typeTicker.maxFPS = 59.99;
    typeTicker.minFPS = 59.99;
  };

  return { startTimer, pauseTimer, setFrameRate };
};

const useTimer = () => {
  const { readPlayer } = usePlayer();

  const setCurrentTime = useSetCurrentTimeState();
  const setDisplayRemainTime = useSetLineRemainTimeState();
  const setDisplayLineKpm = useSetLineKpmState();
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

  const { readLineProgress, readTotalProgress } = useProgress();
  const { readGameUtils, writeGameUtils } = useGameUtilsRef();
  const { readYTStatus } = useYTStatusRef();
  const { readStatus, writeStatus } = useStatusRef();
  const readCurrentTime = useCurrentTimeStateRef();
  const readLineWord = useLineWordStateRef();
  const readTypingStatus = useTypingStatusStateRef();
  const readPlaySpeed = usePlaySpeedStateRef();
  const readScene = useSceneStateRef();
  const readMap = useMapStateRef();
  const { pauseTimer } = useTimerControls();

  const update = ({
    count,
    currentOffesettedYTTime,
    constantLineTime,
    nextLine,
  }: {
    count: number;
    currentOffesettedYTTime: number;
    constantLineTime: number;
    nextLine: LineData;
  }) => {
    const map = readMap();

    calcLineResult({ count, constantLineTime });

    const currentLine = map.mapData[count - 1];
    const movieDuration = readYTStatus().movieDuration;
    if (currentLine["lyrics"] === "end" || currentOffesettedYTTime >= movieDuration) {
      readPlayer().stopVideo();
      pauseTimer();

      return;
    } else if (nextLine) {
      const scene = readScene();
      if (scene === "playing") {
        writeStatus({
          count: readStatus().count + 1,
        });
      } else {
        writeStatus({
          count: getSeekLineCount(currentOffesettedYTTime),
        });
      }

      updateLine(readStatus().count);
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
    setDisplayRemainTime(constantRemainLineTime);

    const lineWord = readLineWord();
    const speed = readPlaySpeed();

    if (lineWord.nextChar["k"]) {
      const typeSpeed = calcTypeSpeed({
        updateType: "timer",
        constantLineTime,
        totalTypeCount: readTypingStatus().type,
      });

      setDisplayLineKpm(typeSpeed!.lineKpm);
    }

    const { isRetrySkip } = readGameUtils();

    if (isRetrySkip && map.mapData[map.startLine].time - 3 * speed.playSpeed <= currentOffesettedYTTime) {
      writeGameUtils({ isRetrySkip: false });
    }

    displaySkipGuide({
      kana: lineWord.nextChar["k"],
      lineConstantTime: constantLineTime,
      lineRemainTime: constantRemainLineTime,
      isRetrySkip,
    });

    const totalProgress = readTotalProgress();
    totalProgress.value = currentOffesettedYTTime;
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
    const count = readStatus().count;
    const nextLine = map.mapData[count];
    const nextLineTime = nextLine.time > movieDuration ? movieDuration : nextLine.time;
    const isUpdateLine =
      currentOffesettedYTTime >= nextLineTime || currentOffesettedYTTime >= readYTStatus().movieDuration;

    if (isUpdateLine) {
      const constantLineTime = getConstantLineTime(currentLineTime);
      update({
        count,
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
    const scene = readScene();

    if (scene === "replay" && count && currentLineTime) {
      const constantLineTime = getConstantLineTime(currentLineTime);
      replay({ constantLineTime });
    }
  };
};

export const useCalcLineResult = () => {
  const setLineResults = useSetLineResultsState();
  const calcTypeSpeed = useCalcTypeSpeed();
  const setCombo = useSetComboState();
  const { setTypingStatus } = useSetTypingStatusState();
  const outPutLineResult = useOutPutLineResult();
  const updateAllStatus = useUpdateAllStatus();

  const { readLineStatus } = useLineStatusRef();
  const { writeUserStats } = useUserStatsRef();
  const { readStatus, writeStatus } = useStatusRef();
  const readLineResults = useLineResultsStateRef();
  const readCombo = useComboStateRef();
  const readLineWord = useLineWordStateRef();
  const readTypingStatus = useTypingStatusStateRef();
  const readPlaySpeed = usePlaySpeedStateRef();
  const readScene = useSceneStateRef();
  const readMap = useMapStateRef();

  return ({ count, constantLineTime }: { count: number; constantLineTime: number }) => {
    const map = readMap();
    const scene = readScene();

    if (scene === "playing" || scene === "practice") {
      const { totalTypeTime, totalLatency } = readStatus();
      const {
        latency: lineLatency,
        type: lineType,
        completedTime,
        startInputMode,
        startSpeed,
      } = readLineStatus();

      const typeSpeed = calcTypeSpeed({
        updateType: "lineUpdate",
        constantLineTime: completedTime || constantLineTime,
        totalTypeCount: readTypingStatus().type,
      });

      const currentLineResult = outPutLineResult({
        newLineWord: readLineWord(),
        totalTypeSpeed: typeSpeed!.totalKpm as number,
      });

      if (count > 0) {
        const isCompleted = readLineStatus().isCompleted;

        const incrementTotalTypeTime = isCompleted ? completedTime : constantLineTime;

        const newTotalTypeTime = totalTypeTime + incrementTotalTypeTime;
        if (map.mapData[count - 1].kpm.r > 0) {
          writeStatus({
            totalTypeTime: newTotalTypeTime,
          });

          if (lineType && (scene === "playing" || scene === "practice")) {
            writeUserStats({
              totalTypeTime: newTotalTypeTime,
            });
          }

          writeStatus({
            totalLatency: totalLatency + lineLatency,
          });
        }

        const lMiss = readLineStatus().miss;
        const point = readTypingStatus().point;
        const timeBonus = readTypingStatus().timeBonus;
        const lineResults = readLineResults();
        const lineScore = point + timeBonus + lMiss * MISS_PENALTY;
        const lResult = lineResults[count - 1];
        const oldLineScore =
          lResult.status!.p! + lResult.status!.tBonus! + lResult.status!.lMiss! * MISS_PENALTY;

        const speed = readPlaySpeed();
        const isUpdateResult = (speed.playSpeed >= 1 && lineScore >= oldLineScore) || scene === "playing";

        if (isUpdateResult) {
          const tTime = Math.round(newTotalTypeTime * 1000) / 1000;
          const mode = startInputMode;
          const sp = startSpeed;
          const typeResult = readLineStatus().typeResult;
          const newLineResults = [...lineResults];
          const combo = readCombo();

          if (map.mapData[count - 1].kpm.r > 0) {
            newLineResults[count - 1] = {
              status: {
                p: point,
                tBonus: timeBonus,
                lType: lineType,
                lMiss,
                lRkpm: typeSpeed!.lineRkpm,
                lKpm: typeSpeed!.lineKpm,
                lostW: currentLineResult.lostWord,
                lLost: currentLineResult.lostLength,
                combo,
                tTime,
                mode,
                sp,
              },
              typeResult,
            };
          } else {
            //間奏ライン
            newLineResults[count - 1] = {
              status: {
                combo,
                tTime,
                mode,
                sp,
              },
              typeResult,
            };
          }

          setLineResults(newLineResults);
        }
      }

      if (scene === "playing") {
        setTypingStatus(currentLineResult.newStatus);
      } else if (scene === "practice") {
        const lineResults = readLineResults();

        const newStatus = updateAllStatus({
          count: map.mapData.length - 1,
          newLineResults: lineResults,
        });
        setTypingStatus(newStatus);
      }
    } else if (scene === "replay") {
      const lineResults = readLineResults();

      const newStatus = updateAllStatus({ count, newLineResults: lineResults });
      setTypingStatus(newStatus);
      if (count > 0) {
        const currentReplayLineResult = lineResults[count - 1];
        setCombo(currentReplayLineResult.status!.combo as number);
        writeStatus({
          totalTypeTime: currentReplayLineResult.status!.tTime,
        });
      }
    }
  };
};

export const useUpdateLine = () => {
  const setLyrics = useSetLyricsState();
  const setNextLyrics = useSetNextLyricsState();
  const setLineWord = useSetLineWordState();
  const setDisplayLineKpm = useSetLineKpmState();
  const setChangeCSSCount = useSetChangeCSSCountState();

  const lineReplayUpdate = useLineReplayUpdate();

  const { readLineProgress } = useProgress();
  const { readYTStatus } = useYTStatusRef();
  const { resetLineStatus, writeLineStatus } = useLineStatusRef();
  const readPlayingInputMode = usePlayingInputModeStateRef();
  const readTypingOptions = useUserTypingOptionsStateRef();
  const readPlaySpeed = usePlaySpeedStateRef();
  const readScene = useSceneStateRef();
  const readMap = useMapStateRef();

  return (newCount: number) => {
    const map = readMap();
    const currentCount = newCount ? newCount - 1 : 0;
    const inputMode = readPlayingInputMode();
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
      lineCount: currentCount,
    });

    setLyrics(map.mapData[currentCount]["lyrics"]);

    const nextKpm =
      (inputMode === "roma" ? map.mapData[newCount].kpm["r"] : map.mapData[newCount].kpm["k"]) *
      speed.playSpeed;
    if (nextKpm) {
      setNextLyrics({
        lyrics:
          readTypingOptions().next_display === "WORD"
            ? map.mapData[newCount].kanaWord
            : map.mapData[newCount]["lyrics"],
        kpm: nextKpm.toFixed(0),
        kanaWord: map.mapData[newCount].kanaWord.slice(0, 60),
        romaWord: map.mapData[newCount].word
          .map((w) => w["r"][0])
          .join("")
          .slice(0, 60),
      });
    } else {
      setNextLyrics({
        lyrics: "",
        kpm: "",
        kanaWord: "",
        romaWord: "",
      });
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

    if (readScene() === "replay") {
      lineReplayUpdate(currentCount);
    }
  };
};
