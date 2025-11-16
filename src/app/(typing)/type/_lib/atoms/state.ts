import type { ExtractAtomValue } from "jotai";
import { atom, useAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import { focusAtom } from "jotai-optics";

import { requestDebouncedAnimationFrame } from "@/utils/debounced-animation-frame";
import type { Updater } from "@/utils/types";
import type { TypingLineResults } from "@/validator/result";
import type { BuiltMapLine, InputMode, LineWord, SceneType, SkipGuideKey } from "../type";
import { setLineResultSelected } from "./family";
import { readTypingOptions } from "./hydrate";
import { lineProgressAtom, readUtilityRefParams } from "./ref";
import { speedBaseAtom } from "./speed-reducer";
import { getTypeAtomStore } from "./store";

const store = getTypeAtomStore();

const builtMapAtom = atomWithReset<{
  lines: BuiltMapLine[];
  totalNotes: { roma: number; kana: number };
  keyRate: number;
  missRate: number;
  initialLineResults: TypingLineResults;
  typingLineIndexes: number[];
  changeCSSIndexes: number[];
  duration: number;
} | null>(null);
export const useBuiltMapState = () => useAtomValue(builtMapAtom, { store });
export const setBuiltMap = (map: ExtractAtomValue<typeof builtMapAtom>) => store.set(builtMapAtom, map);
export const resetBuiltMap = () => store.set(builtMapAtom, RESET);
export const readBuiltMap = () => store.get(builtMapAtom);

export const TAB_NAMES = ["ステータス", "ランキング"] as const;
const utilityParamsAtom = atomWithReset({
  scene: "ready" as SceneType,
  tabName: "ランキング" as (typeof TAB_NAMES)[number],
  inputMode: "roma" as InputMode,
  notify: Symbol(""),
  activeSkipKey: null as SkipGuideKey,
  changeCSSCount: 0,
  isYTStarted: false,
  lineResultdrawerClosure: false,
  isPaused: false,
  movieDuration: 0,
  replayUserName: null as string | null,
  lineSelectIndex: 0,
});

const lineResultDrawerClosureAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("lineResultdrawerClosure"));
const sceneAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("scene"));
const tabNameAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("tabName"));
const notifyAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("notify"));
const activeSkipKeyAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("activeSkipKey"));
const changeCSSCountAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("changeCSSCount"));
const playingInputModeAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("inputMode"));
const isYTStartedAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("isYTStarted"));
const isPausedAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("isPaused"));
const movieDurationAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("movieDuration"));
const lineSelectIndexAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("lineSelectIndex"));
const replayUserNameAtom = focusAtom(utilityParamsAtom, (optic) => optic.prop("replayUserName"));

export const useLineResultSheetOpenState = () => useAtomValue(lineResultDrawerClosureAtom);
export const setLineResultSheet = (update: Updater<boolean>) => {
  store.set(lineResultDrawerClosureAtom, update);
};

const sceneGroupAtom = atom((get) => {
  const scene = get(sceneAtom);
  switch (scene) {
    case "ready": {
      return "Ready";
    }
    case "play":
    case "practice":
    case "replay": {
      return "Playing";
    }
    case "play_end":
    case "practice_end":
    case "replay_end": {
      return "End";
    }
  }
});

export const readUtilityParams = () => store.get(utilityParamsAtom);
export const resetUtilityParams = () => store.set(utilityParamsAtom, RESET);

export const useTabNameState = () => useAtomValue(tabNameAtom);
export const setTabName = (value: ExtractAtomValue<typeof tabNameAtom>) => store.set(tabNameAtom, value);

export const useSceneState = () => useAtomValue(sceneAtom, { store });
export const readScene = () => store.get(sceneAtom);
export const useSceneGroupState = () => useAtomValue(sceneGroupAtom, { store });
export const readSceneGroup = () => store.get(sceneGroupAtom);

export const setScene = (value: ExtractAtomValue<typeof sceneAtom>) => store.set(sceneAtom, value);

export const usePlayingInputModeState = () => useAtomValue(playingInputModeAtom, { store });
export const setPlayingInputMode = (value: ExtractAtomValue<typeof playingInputModeAtom>) =>
  store.set(playingInputModeAtom, value);

export const useActiveSkipGuideKeyState = () => useAtomValue(activeSkipKeyAtom, { store });
export const setActiveSkipGuideKey = (value: ExtractAtomValue<typeof activeSkipKeyAtom>) =>
  store.set(activeSkipKeyAtom, value);

export const useNotifyState = () => useAtomValue(notifyAtom, { store });
export const setNotify = (value: ExtractAtomValue<typeof notifyAtom>) => store.set(notifyAtom, value);

export const useChangeCSSCountState = () => useAtomValue(changeCSSCountAtom, { store });
export const setChangeCSSCount = (newCurrentCount: number) => {
  const map = readBuiltMap();
  if (!map) return;

  if (map.changeCSSIndexes.length > 0) {
    const closestMin = map.changeCSSIndexes
      .filter((count) => count <= newCurrentCount)
      .reduce((prev, curr) => (prev === undefined || curr > prev ? curr : prev), 0);

    store.set(changeCSSCountAtom, closestMin);
  }
};

export const useIsPausedState = () => useAtomValue(isPausedAtom, { store });
export const setIsPaused = (value: ExtractAtomValue<typeof isPausedAtom>) => store.set(isPausedAtom, value);

export const useMovieDurationState = () => useAtomValue(movieDurationAtom, { store });
export const setMovieDuration = (value: ExtractAtomValue<typeof movieDurationAtom>) =>
  store.set(movieDurationAtom, value);

export const useLineSelectIndexState = () => useAtomValue(lineSelectIndexAtom, { store });
export const setLineSelectIndex = (lineIndex: number) => {
  const map = readBuiltMap();
  if (!map) return;

  const count = map.typingLineIndexes[lineIndex - 1];
  if (count === undefined) return;

  const prevSelectedIndex = store.get(lineSelectIndexAtom);
  if (prevSelectedIndex !== null && prevSelectedIndex !== lineIndex) {
    const prevCount = map.typingLineIndexes[prevSelectedIndex - 1];
    if (prevCount !== undefined) {
      setLineResultSelected({ index: prevCount, isSelected: false });
    }
  }

  store.set(lineSelectIndexAtom, lineIndex);
  setLineResultSelected({ index: count, isSelected: true });
};

export const useYTStartedState = () => useAtomValue(isYTStartedAtom);
export const setYTStarted = (value: ExtractAtomValue<typeof isYTStartedAtom>) => store.set(isYTStartedAtom, value);

export const useReplayUserNameState = () => useAtomValue(replayUserNameAtom);
export const setReplayUserName = (value: ExtractAtomValue<typeof replayUserNameAtom>) =>
  store.set(replayUserNameAtom, value);

const substatusAtom = atomWithReset({
  elapsedSecTime: 0,
  lineRemainTime: 0,
  lineKpm: 0,
  combo: 0,
});
export const resetSubstatusState = () => store.set(substatusAtom, RESET);
const lineRemainTimeAtom = focusAtom(substatusAtom, (optic) => optic.prop("lineRemainTime"));
export const useLineRemainTimeState = () => useAtomValue(lineRemainTimeAtom, { store });
export const setLineRemainTime = (value: ExtractAtomValue<typeof lineRemainTimeAtom>) =>
  store.set(lineRemainTimeAtom, value);
const lineKpmAtom = focusAtom(substatusAtom, (optic) => optic.prop("lineKpm"));
export const useLineKpmState = () => useAtomValue(lineKpmAtom, { store });
export const setLineKpm = (value: ExtractAtomValue<typeof lineKpmAtom>) => store.set(lineKpmAtom, value);
export const readLineKpm = () => store.get(lineKpmAtom);
const comboAtom = focusAtom(substatusAtom, (optic) => optic.prop("combo"));
export const useComboState = () => useAtomValue(comboAtom, { store });
export const setCombo = (update: Updater<ExtractAtomValue<typeof comboAtom>>) => store.set(comboAtom, update);
export const readCombo = () => store.get(comboAtom);
const elapsedSecTimeAtom = focusAtom(substatusAtom, (optic) => optic.prop("elapsedSecTime"));
export const useElapsedSecTimeState = () => useAtomValue(elapsedSecTimeAtom, { store });
export const setElapsedSecTime = (value: ExtractAtomValue<typeof elapsedSecTimeAtom>) =>
  store.set(elapsedSecTimeAtom, value);
export const readElapsedSecTime = () => store.get(elapsedSecTimeAtom);

const nextLyricsAtom = atomWithReset({
  lyrics: "",
  kpm: "",
  kanaWord: "",
  romaWord: "",
});
export const useNextLyricsState = () => useAtomValue(nextLyricsAtom, { store });
export const setNextLyrics = (line: BuiltMapLine) => {
  const typingOptions = readTypingOptions();
  const inputMode = store.get(playingInputModeAtom);
  const speed = store.get(speedBaseAtom);
  const nextKpm = (inputMode === "roma" ? line.kpm.roma : line.kpm.kana) * speed.playSpeed;
  store.set(nextLyricsAtom, () => {
    if (line.kanaWord) {
      return {
        lyrics: typingOptions.nextDisplay === "WORD" ? line.kanaWord : line.lyrics,
        kpm: nextKpm.toFixed(0),
        kanaWord: line.kanaWord.slice(0, 60),
        romaWord: line.word
          .map((w) => w.r[0])
          .join("")
          .slice(0, 60),
      };
    }

    return RESET;
  });
};
export const resetNextLyrics = () => store.set(nextLyricsAtom, RESET);

const currentLineAtom = atomWithReset<{ lineWord: LineWord; lyrics: string }>({
  lineWord: {
    correct: { k: "", r: "" },
    nextChar: { k: "", r: [""], p: 0, t: undefined },
    word: [{ k: "", r: [""], p: 0, t: undefined }],
  },
  lyrics: "",
});
const lineWordAtom = focusAtom(currentLineAtom, (optic) => optic.prop("lineWord"));
const lineLyricsAtom = focusAtom(currentLineAtom, (optic) => optic.prop("lyrics"));
export const useLineWordState = () => useAtomValue(lineWordAtom, { store });
export const setLineWord = (value: ExtractAtomValue<typeof lineWordAtom>) => store.set(lineWordAtom, value);
export const readLineWord = () => store.get(lineWordAtom);
export const useLyricsState = () => useAtomValue(lineLyricsAtom, { store });
export const setNewLine = ({
  newCurrentLine,
  newNextLine,
}: {
  newCurrentLine: BuiltMapLine;
  newNextLine: BuiltMapLine;
}) => {
  const cloneWord = structuredClone([...newCurrentLine.word]);
  const nextChar = cloneWord[0];
  if (!nextChar) return;

  store.set(currentLineAtom, {
    lineWord: {
      correct: { k: "", r: "" },
      nextChar,
      word: cloneWord.slice(1),
    },
    lyrics: newCurrentLine.lyrics,
  });

  const lineProgress = store.get(lineProgressAtom);
  const { isPaused } = store.get(utilityParamsAtom);

  if (lineProgress && !isPaused) {
    requestDebouncedAnimationFrame("line-progress", () => {
      if (lineProgress) {
        lineProgress.value = 0;
        lineProgress.max = newNextLine.time - newCurrentLine.time;
      }
    });
  }
};
export const resetCurrentLine = () => {
  store.set(currentLineAtom, RESET);
  const map = store.get(builtMapAtom);
  const lineProgress = store.get(lineProgressAtom);

  if (lineProgress && map && map.lines[1]) {
    lineProgress.value = 0;
    lineProgress.max = map.lines[1].time;
  }
};

const typingStatusAtom = atomWithReset({
  score: 0,
  type: 0,
  kpm: 0,
  rank: 0,
  point: 0,
  miss: 0,
  lost: 0,
  line: 0,
  timeBonus: 0,
});
export const focusTypingStatusAtoms = {
  score: focusAtom(typingStatusAtom, (optic) => optic.prop("score")),
  type: focusAtom(typingStatusAtom, (optic) => optic.prop("type")),
  kpm: focusAtom(typingStatusAtom, (optic) => optic.prop("kpm")),
  rank: focusAtom(typingStatusAtom, (optic) => optic.prop("rank")),
  point: focusAtom(typingStatusAtom, (optic) => optic.prop("point")),
  miss: focusAtom(typingStatusAtom, (optic) => optic.prop("miss")),
  lost: focusAtom(typingStatusAtom, (optic) => optic.prop("lost")),
  line: focusAtom(typingStatusAtom, (optic) => optic.prop("line")),
  timeBonus: focusAtom(typingStatusAtom, (optic) => optic.prop("timeBonus")),
};
export const useTypingStatusState = () => useAtomValue(typingStatusAtom, { store });
export const setLineStatus = (value: ExtractAtomValue<typeof focusTypingStatusAtoms.line>) =>
  store.set(focusTypingStatusAtoms.line, value);
export const setRankStatus = (value: ExtractAtomValue<typeof focusTypingStatusAtoms.rank>) =>
  store.set(focusTypingStatusAtoms.rank, value);
export const setTypingStatus = (update: Updater<ExtractAtomValue<typeof typingStatusAtom>>) =>
  store.set(typingStatusAtom, update);
export const resetTypingStatus = () => {
  store.set(typingStatusAtom, RESET);
  const map = readBuiltMap();
  setLineStatus(map?.typingLineIndexes.length || 0);
  const { rankingScores } = readUtilityRefParams();
  setRankStatus(rankingScores.length + 1);
};
export const readTypingStatus = () => store.get(typingStatusAtom);
