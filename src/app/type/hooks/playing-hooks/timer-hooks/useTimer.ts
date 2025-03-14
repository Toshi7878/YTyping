import {
  gameStateRefAtom,
  lineProgressRefAtom,
  lineTypingStatusRefAtom,
  totalProgressRefAtom,
  typingStatusRefAtom,
  usePlayer,
  userStatsRefAtom,
  ytStateRefAtom,
} from "@/app/type/atoms/refAtoms";
import {
  comboAtom,
  currentTimeSSMMAtom,
  focusTypingStatusAtoms,
  lineResultsAtom,
  lineWordAtom,
  useMapAtom,
  usePlayingInputModeAtom,
  usePlaySpeedAtom,
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
  useSetTypingStatusAtoms,
  useUserTypingOptionsAtom,
} from "@/app/type/atoms/stateAtoms";
import { useDisplaySkipGuide } from "@/app/type/hooks/playing-hooks/timer-hooks/useDisplaySkipGuide";
import { typeTicker } from "@/app/type/ts/const/consts";
import { useStore } from "jotai";
import { CreateMap, MISS_PENALTY } from "../../../../../lib/instanceMapData";
import { LineData } from "../../../ts/type";
import { useCalcTypeSpeed } from "../../calcTypeSpeed";
import { useGetTime } from "../../useGetTime";
import { useOutPutLineResult } from "../useOutPutLineResult";
import { useLineReplayUpdate, useReplay, useUpdateAllStatus } from "./replayHooks";
import { useGetSeekLineCount } from "./useSeekGetLineCount";

export const usePlayTimer = () => {
  const map = useMapAtom() as CreateMap;
  const scene = useSceneAtom();
  const speed = usePlaySpeedAtom();
  const typeAtomStore = useStore();
  const player = usePlayer();

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
    const movieDuration = typeAtomStore.get(ytStateRefAtom).movieDuration;
    if (currentLine?.["lyrics"] === "end" || currentOffesettedYTTime >= movieDuration) {
      player.stopVideo();
      typeTicker.stop();

      return;
    } else if (nextLine) {
      if (scene === "playing") {
        const newCount = typeAtomStore.get(typingStatusRefAtom).count + 1;
        updateLine(newCount);
      } else {
        updateLine(getSeekLineCount(currentOffesettedYTTime));
      }
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
    typeAtomStore.get(gameStateRefAtom).displayLineTimeCount = constantRemainLineTime;

    setDisplayRemainTime(constantRemainLineTime);

    const lineWord = typeAtomStore.get(lineWordAtom);

    if (lineWord.nextChar["k"]) {
      const typeSpeed = calcTypeSpeed({
        updateType: "timer",
        constantLineTime,
        totalTypeCount: typeAtomStore.get(focusTypingStatusAtoms.type),
      });

      setDisplayLineKpm(typeSpeed!.lineKpm);
    }

    const isRetrySkip = typeAtomStore.get(gameStateRefAtom).isRetrySkip;

    if (
      isRetrySkip &&
      map.mapData[map.startLine].time - 3 * speed.playSpeed <= currentOffesettedYTTime
    ) {
      typeAtomStore.get(gameStateRefAtom).isRetrySkip = false;
    }

    displaySkipGuide({
      kana: lineWord.nextChar["k"],
      lineConstantTime: constantLineTime,
      lineRemainTime: constantRemainLineTime,
      isRetrySkip,
    });

    const totalProgress = typeAtomStore.get(totalProgressRefAtom);
    totalProgress!.value = currentOffesettedYTTime;

    const currentTimeSSMM = typeAtomStore.get(currentTimeSSMMAtom);
    if (Math.abs(constantOffesettedYTTime - currentTimeSSMM) >= 1) {
      setCurrentTimeSSMM(constantOffesettedYTTime);
    }
  };

  return () => {
    const currentOffesettedYTTime = getCurrentOffsettedYTTime();
    const currentLineTime = getCurrentLineTime(currentOffesettedYTTime);

    const movieDuration = typeAtomStore.get(ytStateRefAtom).movieDuration;
    const count = typeAtomStore.get(typingStatusRefAtom).count;
    const nextLine = map.mapData[count];
    const nextLineTime = nextLine.time > movieDuration ? movieDuration : nextLine.time;
    const isUpdateLine =
      currentOffesettedYTTime >= nextLineTime ||
      currentOffesettedYTTime >= typeAtomStore.get(ytStateRefAtom).movieDuration;

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
          typeAtomStore.get(gameStateRefAtom).displayLineTimeCount
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

    const lineProgress = typeAtomStore.get(lineProgressRefAtom);
    lineProgress!.value =
      currentOffesettedYTTime < 0 ? nextLine.time + currentOffesettedYTTime : currentLineTime;

    if (scene === "replay" && count && currentLineTime) {
      const constantLineTime = getConstantLineTime(currentLineTime);
      replay({ constantLineTime });
    }
  };
};

export const useCalcLineResult = () => {
  const map = useMapAtom() as CreateMap;
  const scene = useSceneAtom();
  const speed = usePlaySpeedAtom();

  const typeAtomStore = useStore();
  const setLineResults = useSetLineResultsAtom();
  const calcTypeSpeed = useCalcTypeSpeed();
  const setCombo = useSetComboAtom();
  const { setTypingStatus } = useSetTypingStatusAtoms();
  const outPutLineResult = useOutPutLineResult();
  const updateAllStatus = useUpdateAllStatus();

  return ({ count, constantLineTime }: { count: number; constantLineTime: number }) => {
    if (scene === "playing" || scene === "practice") {
      const completedTime = typeAtomStore.get(lineTypingStatusRefAtom).completedTime;

      const typeSpeed = calcTypeSpeed({
        updateType: "lineUpdate",
        constantLineTime: completedTime || constantLineTime,
        totalTypeCount: typeAtomStore.get(focusTypingStatusAtoms.type),
      });

      const currentLineResult = outPutLineResult({
        newLineWord: typeAtomStore.get(lineWordAtom),
        totalTypeSpeed: typeSpeed!.totalKpm as number,
      });

      if (count > 0) {
        const isCompleted = typeAtomStore.get(lineTypingStatusRefAtom).isCompleted;

        const incrementTotalTypeTime = isCompleted ? completedTime : constantLineTime;

        if (map.mapData[count - 1].kpm.r > 0) {
          typeAtomStore.set(typingStatusRefAtom, (prev) => ({
            ...prev,
            totalTypeTime: prev.totalTypeTime + incrementTotalTypeTime,
          }));
          const lineTypeCount = typeAtomStore.get(lineTypingStatusRefAtom).type;

          if (lineTypeCount && (scene === "playing" || scene === "practice")) {
            typeAtomStore.set(userStatsRefAtom, (prev) => ({
              ...prev,
              totalTypeTime: incrementTotalTypeTime,
            }));
          }

          const latency = typeAtomStore.get(lineTypingStatusRefAtom).latency;
          typeAtomStore.set(typingStatusRefAtom, (prev) => ({
            ...prev,
            totalLatency: prev.totalLatency + latency,
          }));
        }

        const lMiss = typeAtomStore.get(lineTypingStatusRefAtom).miss;
        const point = typeAtomStore.get(focusTypingStatusAtoms.point);
        const timeBonus = typeAtomStore.get(focusTypingStatusAtoms.timeBonus);
        const lineResults = typeAtomStore.get(lineResultsAtom);
        const lineScore = point + timeBonus + lMiss * MISS_PENALTY;
        const lResult = lineResults[count - 1];
        const oldLineScore =
          lResult.status!.p! + lResult.status!.tBonus! + lResult.status!.lMiss! * MISS_PENALTY;

        const isUpdateResult =
          (speed.playSpeed >= 1 && lineScore >= oldLineScore) || scene === "playing";

        if (isUpdateResult) {
          const tTime =
            Math.round(typeAtomStore.get(typingStatusRefAtom).totalTypeTime * 1000) / 1000;
          const mode = typeAtomStore.get(lineTypingStatusRefAtom).startInputMode;
          const sp = typeAtomStore.get(lineTypingStatusRefAtom).startSpeed;
          const typeResult = typeAtomStore.get(lineTypingStatusRefAtom).typeResult;
          const newLineResults = [...lineResults];
          const combo = typeAtomStore.get(comboAtom);

          if (map.mapData[count - 1].kpm.r > 0) {
            newLineResults[count - 1] = {
              status: {
                p: point,
                tBonus: timeBonus,
                lType: typeAtomStore.get(lineTypingStatusRefAtom).type,
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
        const lineResults = typeAtomStore.get(lineResultsAtom);

        const newStatus = updateAllStatus({
          count: map!.mapData.length - 1,
          newLineResults: lineResults,
        });
        setTypingStatus(newStatus);
      }
    } else if (scene === "replay") {
      const lineResults = typeAtomStore.get(lineResultsAtom);

      const newStatus = updateAllStatus({ count, newLineResults: lineResults });
      setTypingStatus(newStatus);
      if (count > 0) {
        const currentReplayLineResult = lineResults[count - 1];
        setCombo(currentReplayLineResult.status!.combo as number);
        typeAtomStore.get(typingStatusRefAtom).totalTypeTime =
          currentReplayLineResult.status!.tTime;
      }
    }
  };
};

export const useUpdateLine = () => {
  const map = useMapAtom() as CreateMap;
  const userOptions = useUserTypingOptionsAtom();
  const inputMode = usePlayingInputModeAtom();
  const speed = usePlaySpeedAtom();
  const scene = useSceneAtom();
  const typeAtomStore = useStore();

  const setLyrics = useSetLyricsAtom();
  const setNextLyrics = useSetNextLyricsAtom();
  const setLineWord = useSetLineWordAtom();
  const setDisplayLineKpm = useSetDisplayLineKpmAtom();
  const setChangeCSSCount = useSetChangeCSSCountAtom();

  const lineReplayUpdate = useLineReplayUpdate();
  return (newCount: number) => {
    const currentCount = newCount ? newCount - 1 : 0;
    typeAtomStore.set(lineTypingStatusRefAtom, {
      type: 0,
      miss: 0,
      completedTime: 0,
      latency: 0,
      typeResult: [],
      startSpeed: speed.playSpeed,
      startInputMode: inputMode,
      isCompleted: false,
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
          userOptions.next_display === "WORD"
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
    const movieDuration = typeAtomStore.get(ytStateRefAtom).movieDuration;

    const lineProgress = typeAtomStore.get(lineProgressRefAtom);
    lineProgress!.max =
      (nextTime > movieDuration ? movieDuration : nextTime) -
      Number(map.mapData[currentCount]["time"]);

    if (scene === "replay") {
      lineReplayUpdate(currentCount);
    }
  };
};
