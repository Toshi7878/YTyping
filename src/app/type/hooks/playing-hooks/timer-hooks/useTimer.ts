import {
  useGameUtilsRef,
  useLineStatusRef,
  usePlayer,
  useProgress,
  useStatusRef,
  useUserStatsRef,
  useYTStatusRef,
} from "@/app/type/atoms/refAtoms";
import {
  useComboStateRef,
  useCurrentTimeStateRef,
  useLineResultsStateRef,
  useLineWordStateRef,
  useMapState,
  usePlayingInputModeStateRef,
  usePlaySpeedStateRef,
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
import { typeTicker } from "@/app/type/ts/const/consts";
import { MISS_PENALTY } from "../../../../../lib/instanceMapData";
import { LineData } from "../../../ts/type";
import { useCalcTypeSpeed } from "../../calcTypeSpeed";
import { useGetTime } from "../../useGetTime";
import { useOutPutLineResult } from "../useOutPutLineResult";
import { useLineReplayUpdate, useReplay, useUpdateAllStatus } from "./replayHooks";
import { useGetSeekLineCount } from "./useSeekGetLineCount";

export const usePlayTimer = () => {
  const map = useMapState();
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
  const { readYTStatusRef } = useYTStatusRef();
  const { readStatusRef, writeStatusRef } = useStatusRef();
  const readCurrentTime = useCurrentTimeStateRef();
  const readLineWord = useLineWordStateRef();
  const readTypingStatus = useTypingStatusStateRef();
  const readPlaySpeed = usePlaySpeedStateRef();
  const readScene = useSceneStateRef();

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
    calcLineResult({ count, constantLineTime });

    const currentLine = map.mapData[count - 1];
    const movieDuration = readYTStatusRef().movieDuration;
    if (currentLine?.["lyrics"] === "end" || currentOffesettedYTTime >= movieDuration) {
      readPlayer().stopVideo();
      typeTicker.stop();

      return;
    } else if (nextLine) {
      const scene = readScene();
      if (scene === "playing") {
        writeStatusRef({
          count: readStatusRef().count + 1,
        });
      } else {
        writeStatusRef({
          count: getSeekLineCount(currentOffesettedYTTime),
        });
      }

      updateLine(readStatusRef().count);
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

    if (
      isRetrySkip &&
      map.mapData[map.startLine].time - 3 * speed.playSpeed <= currentOffesettedYTTime
    ) {
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
    const currentOffesettedYTTime = getCurrentOffsettedYTTime();
    const currentLineTime = getCurrentLineTime(currentOffesettedYTTime);

    const movieDuration = readYTStatusRef().movieDuration;
    const count = readStatusRef().count;
    const nextLine = map.mapData[count];
    const nextLineTime = nextLine.time > movieDuration ? movieDuration : nextLine.time;
    const isUpdateLine =
      currentOffesettedYTTime >= nextLineTime ||
      currentOffesettedYTTime >= readYTStatusRef().movieDuration;

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
  const map = useMapState();

  const setLineResults = useSetLineResultsState();
  const calcTypeSpeed = useCalcTypeSpeed();
  const setCombo = useSetComboState();
  const { setTypingStatus } = useSetTypingStatusState();
  const outPutLineResult = useOutPutLineResult();
  const updateAllStatus = useUpdateAllStatus();

  const { readLineStatusRef } = useLineStatusRef();
  const { writeUserStatsRef } = useUserStatsRef();
  const { readStatusRef, writeStatusRef } = useStatusRef();
  const readLineResults = useLineResultsStateRef();
  const readCombo = useComboStateRef();
  const readLineWord = useLineWordStateRef();
  const readTypingStatus = useTypingStatusStateRef();
  const readPlaySpeed = usePlaySpeedStateRef();
  const readScene = useSceneStateRef();

  return ({ count, constantLineTime }: { count: number; constantLineTime: number }) => {
    const scene = readScene();
    if (scene === "playing" || scene === "practice") {
      const completedTime = readLineStatusRef().completedTime;

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
        const isCompleted = readLineStatusRef().isCompleted;

        const incrementTotalTypeTime = isCompleted ? completedTime : constantLineTime;

        if (map.mapData[count - 1].kpm.r > 0) {
          writeStatusRef({
            totalTypeTime: readStatusRef().totalTypeTime + incrementTotalTypeTime,
          });
          const lineTypeCount = readLineStatusRef().type;

          if (lineTypeCount && (scene === "playing" || scene === "practice")) {
            writeUserStatsRef({
              totalTypeTime: incrementTotalTypeTime,
            });
          }

          const lineLatency = readLineStatusRef().latency;

          writeStatusRef({
            totalLatency: readStatusRef().totalLatency + lineLatency,
          });
        }

        const lMiss = readLineStatusRef().miss;
        const point = readTypingStatus().point;
        const timeBonus = readTypingStatus().timeBonus;
        const lineResults = readLineResults();
        const lineScore = point + timeBonus + lMiss * MISS_PENALTY;
        const lResult = lineResults[count - 1];
        const oldLineScore =
          lResult.status!.p! + lResult.status!.tBonus! + lResult.status!.lMiss! * MISS_PENALTY;

        const speed = readPlaySpeed();
        const isUpdateResult =
          (speed.playSpeed >= 1 && lineScore >= oldLineScore) || scene === "playing";

        if (isUpdateResult) {
          const tTime = Math.round(readStatusRef().totalTypeTime * 1000) / 1000;
          const mode = readLineStatusRef().startInputMode;
          const sp = readLineStatusRef().startSpeed;
          const typeResult = readLineStatusRef().typeResult;
          const newLineResults = [...lineResults];
          const combo = readCombo();

          if (map.mapData[count - 1].kpm.r > 0) {
            newLineResults[count - 1] = {
              status: {
                p: point,
                tBonus: timeBonus,
                lType: readLineStatusRef().type,
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
          count: map!.mapData.length - 1,
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
        writeStatusRef({
          totalTypeTime: currentReplayLineResult.status!.tTime,
        });
      }
    }
  };
};

export const useUpdateLine = () => {
  const map = useMapState();

  const setLyrics = useSetLyricsState();
  const setNextLyrics = useSetNextLyricsState();
  const setLineWord = useSetLineWordState();
  const setDisplayLineKpm = useSetLineKpmState();
  const setChangeCSSCount = useSetChangeCSSCountState();

  const lineReplayUpdate = useLineReplayUpdate();

  const { readLineProgress } = useProgress();
  const { readYTStatusRef } = useYTStatusRef();
  const { resetLineStatusRef, writeLineStatusRef } = useLineStatusRef();
  const readPlayingInputMode = usePlayingInputModeStateRef();
  const readTypingOptions = useUserTypingOptionsStateRef();
  const readPlaySpeed = usePlaySpeedStateRef();
  const readScene = useSceneStateRef();

  return (newCount: number) => {
    const currentCount = newCount ? newCount - 1 : 0;
    const inputMode = readPlayingInputMode();
    resetLineStatusRef();
    const speed = readPlaySpeed();
    writeLineStatusRef({
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
    const movieDuration = readYTStatusRef().movieDuration;

    const lineProgress = readLineProgress();
    lineProgress.max =
      (nextTime > movieDuration ? movieDuration : nextTime) - Number(map.mapData[currentCount]["time"]);

    if (readScene() === "replay") {
      lineReplayUpdate(currentCount);
    }
  };
};
