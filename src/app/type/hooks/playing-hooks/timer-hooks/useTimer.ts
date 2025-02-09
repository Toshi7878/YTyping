import { useDisplaySkipGuide } from "@/app/type/hooks/playing-hooks/timer-hooks/useDisplaySkipGuide";
import { typeTicker } from "@/app/type/ts/const/consts";
import {
  comboAtom,
  currentTimeSSMMAtom,
  lineResultsAtom,
  lineWordAtom,
  useMapAtom,
  usePlayingInputModeAtom,
  useSceneAtom,
  useSetChangeCSSCountAtom,
  useSetComboAtom,
  useSetCurrentTimeSSMMAtom,
  useSetDisplayLineKpmAtom,
  useSetDisplayLineRemainTimeAtom,
  useSetLineResultsAtom,
  useSetLineWordAtom,
  useSetLyricsAtom,
  useSetNextLyricsAtom,
  useSetStatusAtoms,
  useStatusAtomsValues,
  useTypePageSpeedAtom,
  useUserOptionsAtom,
} from "@/app/type/type-atoms/gameRenderAtoms";
import { useRefs } from "@/app/type/type-contexts/refsProvider";
import { useStore } from "jotai";
import { CreateMap, MISS_PENALTY } from "../../../../../lib/instanceMapData";
import { DEFAULT_STATUS_REF } from "../../../ts/const/typeDefaultValue";
import { useCalcTypeSpeed } from "../../../ts/scene-ts/playing/calcTypeSpeed";
import { LineData, Status } from "../../../ts/type";
import { useGetTime } from "../../useGetTime";
import { useOutPutLineResult } from "../useOutPutLineResult";
import { useLineReplayUpdate, useReplay, useUpdateAllStatus } from "./replayHooks";
import { useGetSeekLineCount } from "./useSeekGetLineCount";

export const usePlayTimer = () => {
  const { statusRef, gameStateRef, lineProgressRef, totalProgressRef, ytStateRef, playerRef } =
    useRefs();
  const map = useMapAtom() as CreateMap;
  const scene = useSceneAtom();
  const speed = useTypePageSpeedAtom();
  const typeAtomStore = useStore();

  const setCurrentTimeSSMM = useSetCurrentTimeSSMMAtom();
  const setDisplayRemainTime = useSetDisplayLineRemainTimeAtom();
  const setDisplayLineKpm = useSetDisplayLineKpmAtom();
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
  const statusAtomsValues = useStatusAtomsValues();

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
    if (
      currentLine?.["lyrics"] === "end" ||
      currentOffesettedYTTime >= ytStateRef.current!.movieDuration
    ) {
      playerRef.current!.stopVideo();
      typeTicker.stop();

      return;
    } else if (nextLine) {
      if (scene === "playing") {
        statusRef.current!.status.count += 1;
      } else {
        statusRef.current!.status.count = getSeekLineCount(currentOffesettedYTTime);
      }

      updateLine(statusRef.current!.status.count);
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
    gameStateRef.current!.displayLineTimeCount = constantRemainLineTime;
    setDisplayRemainTime(constantRemainLineTime);

    const lineWord = typeAtomStore.get(lineWordAtom);

    if (lineWord.nextChar["k"]) {
      const status = statusAtomsValues();

      const typeSpeed = calcTypeSpeed({
        updateType: "timer",
        constantLineTime,
        totalTypeCount: status.type,
      });
      setDisplayLineKpm(typeSpeed!.lineKpm);
    }

    const isRetrySkip = gameStateRef.current!.isRetrySkip;

    if (
      isRetrySkip &&
      map.mapData[map.startLine].time - 3 * speed.playSpeed <= currentOffesettedYTTime
    ) {
      gameStateRef.current!.isRetrySkip = false;
    }

    displaySkipGuide({
      kana: lineWord.nextChar["k"],
      lineConstantTime: constantLineTime,
      lineRemainTime: constantRemainLineTime,
      isRetrySkip,
    });
    totalProgressRef.current!.value = currentOffesettedYTTime;

    const currentTimeSSMM = typeAtomStore.get(currentTimeSSMMAtom);
    if (Math.abs(constantOffesettedYTTime - currentTimeSSMM) >= 1) {
      setCurrentTimeSSMM(constantOffesettedYTTime);
    }
  };

  return () => {
    const currentOffesettedYTTime = getCurrentOffsettedYTTime();
    const currentLineTime = getCurrentLineTime(currentOffesettedYTTime);
    const movieDuration = ytStateRef.current!.movieDuration;
    const count = statusRef.current!.status.count;
    const nextLine = map.mapData[count];
    const nextLineTime = nextLine.time > movieDuration ? movieDuration : nextLine.time;
    const isUpdateLine =
      currentOffesettedYTTime >= nextLineTime ||
      currentOffesettedYTTime >= ytStateRef.current!.movieDuration;

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
    const isUpdateMs =
      Math.abs(
        nextLineTime / speed.playSpeed -
          constantOffesettedYTTime -
          gameStateRef.current!.displayLineTimeCount
      ) >= 0.1;
    if (isUpdateMs) {
      const constantRemainLineTime = getCurrentLineRemainTime(currentOffesettedYTTime);
      const constantLineTime = getConstantLineTime(currentLineTime);
      updateMs({
        currentOffesettedYTTime,
        constantOffesettedYTTime,
        constantLineTime,
        constantRemainLineTime,
      });
    }

    lineProgressRef.current!.value =
      currentOffesettedYTTime < 0 ? nextLine.time + currentOffesettedYTTime : currentLineTime;

    if (scene === "replay" && count && currentLineTime) {
      const constantLineTime = getConstantLineTime(currentLineTime);
      replay({ constantLineTime });
    }
  };
};

export const useCalcLineResult = () => {
  const { statusRef } = useRefs();
  const map = useMapAtom() as CreateMap;
  const scene = useSceneAtom();
  const speed = useTypePageSpeedAtom();

  const typeAtomStore = useStore();
  const setLineResults = useSetLineResultsAtom();
  const calcTypeSpeed = useCalcTypeSpeed();
  const setCombo = useSetComboAtom();
  const { setStatusValues } = useSetStatusAtoms();
  const statusAtomsValues = useStatusAtomsValues();
  const outPutLineResult = useOutPutLineResult();
  const updateAllStatus = useUpdateAllStatus();

  return ({ count, constantLineTime }: { count: number; constantLineTime: number }) => {
    const status: Status = statusAtomsValues();

    if (scene === "playing" || scene === "practice") {
      const typeSpeed = calcTypeSpeed({
        updateType: "lineUpdate",
        constantLineTime: statusRef.current!.lineStatus.lineClearTime,
        totalTypeCount: status.type,
      });

      const lineWord = typeAtomStore.get(lineWordAtom);

      const currentLineResult = outPutLineResult({
        newLineWord: lineWord,
        totalTypeSpeed: typeSpeed!.totalKpm as number,
      });

      if (count > 0) {
        const lineResults = typeAtomStore.get(lineResultsAtom);

        statusRef.current!.status.totalTypeTime += lineWord.nextChar["k"]
          ? constantLineTime
          : statusRef.current!.lineStatus.lineClearTime;

        const lineTypeCount = statusRef.current!.lineStatus.lineType;

        if (lineTypeCount && (scene === "playing" || scene === "practice")) {
          statusRef.current!.userStats.totalTypeTime += lineWord.nextChar["k"]
            ? constantLineTime
            : statusRef.current!.lineStatus.lineClearTime;
        }

        statusRef.current!.status.totalLatency += statusRef.current!.lineStatus.latency;

        const lMiss = statusRef.current!.lineStatus.lineMiss;
        const lineScore = status!.point + status!.timeBonus + lMiss * MISS_PENALTY;
        const lResult = lineResults[count - 1];
        const oldLineScore =
          lResult.status!.p! + lResult.status!.tBonus! + lResult.status!.lMiss! * MISS_PENALTY;

        const isUpdateResult =
          (speed.playSpeed >= 1 && lineScore >= oldLineScore) || scene === "playing";

        if (isUpdateResult) {
          const tTime = Math.round(statusRef.current!.status.totalTypeTime * 1000) / 1000;
          const mode = statusRef.current!.lineStatus.lineStartInputMode;
          const sp = statusRef.current!.lineStatus.lineStartSpeed;
          const typeResult = statusRef.current!.lineStatus.typeResult;
          const newLineResults = [...lineResults];
          const combo = typeAtomStore.get(comboAtom);

          if (map.mapData[count - 1].kpm.r > 0) {
            newLineResults[count - 1] = {
              status: {
                p: status!.point,
                tBonus: status!.timeBonus,
                lType: statusRef.current!.lineStatus.lineType,
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
        setStatusValues(currentLineResult.newStatus);
      } else if (scene === "practice") {
        const lineResults = typeAtomStore.get(lineResultsAtom);

        const newStatus = updateAllStatus({
          count: map!.mapData.length - 1,
          newLineResults: lineResults,
        });
        setStatusValues(newStatus);
      }
    } else if (scene === "replay") {
      const lineResults = typeAtomStore.get(lineResultsAtom);

      const newStatus = updateAllStatus({ count, newLineResults: lineResults });
      setStatusValues(newStatus);
      if (count > 0) {
        const currentReplayLineResult = lineResults[count - 1];
        setCombo(currentReplayLineResult.status!.combo as number);
        statusRef.current!.status.totalTypeTime = currentReplayLineResult.status!.tTime;
      }
    }
  };
};

export const useUpdateLine = () => {
  const { statusRef, lineProgressRef, ytStateRef } = useRefs();

  const map = useMapAtom() as CreateMap;
  const userOptions = useUserOptionsAtom();
  const inputMode = usePlayingInputModeAtom();
  const speed = useTypePageSpeedAtom();
  const scene = useSceneAtom();

  const setLyrics = useSetLyricsAtom();
  const setNextLyrics = useSetNextLyricsAtom();
  const setLineWord = useSetLineWordAtom();
  const setDisplayLineKpm = useSetDisplayLineKpmAtom();
  const setChangeCSSCount = useSetChangeCSSCountAtom();

  const lineReplayUpdate = useLineReplayUpdate();
  return (newCount: number) => {
    const currentCount = newCount ? newCount - 1 : 0;
    statusRef.current!.lineStatus = structuredClone({
      ...DEFAULT_STATUS_REF.lineStatus,
      lineStartSpeed: speed.playSpeed,
      lineStartInputMode: inputMode,
    });
    setDisplayLineKpm(0);
    statusRef.current!.lineStatus.latency = 0;
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
          userOptions.next_display === "WORD"
            ? map.mapData[newCount].kanaWord
            : map.mapData[newCount]["lyrics"],
        kpm: nextKpm.toFixed(0),
      });
    } else {
      setNextLyrics({
        lyrics: "",
        kpm: "",
      });
    }

    if (map.mapChangeCSSCounts.length) {
      //changeCSSの現在のstyle適用ラインカウントを取得

      // currentCountに一番近い最小の数字を見つける
      const closestMin = map.mapChangeCSSCounts
        .filter((count) => count <= currentCount)
        .reduce((prev, curr) => (prev === undefined || curr > prev ? curr : prev), 0);
      setChangeCSSCount(closestMin);
    }

    if (lineProgressRef.current) {
      const progressElement = lineProgressRef.current as HTMLProgressElement;
      const nextTime = Number(map.mapData[newCount]["time"]);
      const movieDuration = ytStateRef.current!.movieDuration;

      progressElement.max =
        (nextTime > movieDuration ? movieDuration : nextTime) -
        Number(map.mapData[currentCount]["time"]);
    }

    if (scene === "replay") {
      lineReplayUpdate(currentCount);
    }
  };
};
