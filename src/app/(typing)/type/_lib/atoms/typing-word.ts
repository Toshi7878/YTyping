import { useAtomValue } from "jotai";
import { atom, type ExtractAtomValue } from "jotai/vanilla";
import { atomWithReset, RESET } from "jotai/vanilla/utils";
import { focusAtom } from "jotai-optics";
import { createTypingWord, type TypingWord } from "lyrics-typing-engine";
import type { BuiltMapLineWithOption } from "@/lib/types";
import { requestDebouncedAnimationFrame } from "@/utils/debounced-animation-frame";
import { readTypingOptions, wordDisplayAtom } from "./hydrate";
import { readLineProgress } from "./ref";
import { playingInputModeAtom, readBuiltMap, readUtilityParams } from "./state";
import { getTypeAtomStore } from "./store";

const store = getTypeAtomStore();

const lineAtom = atomWithReset<{ typingWord: TypingWord; lyrics: string }>({
  typingWord: {
    correct: { kana: "", roma: "" },
    nextChunk: { kana: "", romaPatterns: [], point: 0, type: undefined },
    wordChunks: [{ kana: "", romaPatterns: [], point: 0, type: undefined }],
  },
  lyrics: "",
});
export const typingWordAtom = focusAtom(lineAtom, (optic) => optic.prop("typingWord"));
const isLineCompletedAtom = atom((get) => {
  const typingWord = get(typingWordAtom);
  return !typingWord.nextChunk.kana && !!typingWord.correct.kana;
});
const lyricsAtom = focusAtom(lineAtom, (optic) => optic.prop("lyrics"));
export const setTypingWord = (value: ExtractAtomValue<typeof typingWordAtom>) => store.set(typingWordAtom, value);
export const useIsLineCompletedState = () => useAtomValue(isLineCompletedAtom);
export const readTypingWord = () => store.get(typingWordAtom);
export const useLyricsState = () => useAtomValue(lyricsAtom, { store });
export const setNewLine = (newLine: BuiltMapLineWithOption) => {
  store.set(lineAtom, { typingWord: createTypingWord(newLine), lyrics: newLine.lyrics });

  const lineProgress = readLineProgress();
  const { isPaused } = readUtilityParams();

  if (lineProgress && !isPaused) {
    lineProgress.value = 0;
    lineProgress.max = newLine.duration;
  }
};
export const resetCurrentLine = () => {
  store.set(lineAtom, RESET);
  const map = readBuiltMap();
  const lineProgress = readLineProgress();

  if (lineProgress && map && map.lines[1]) {
    lineProgress.value = 0;
    lineProgress.max = map.lines[1].time;
  }
};

const mainWordElementsAtom = atomWithReset<{
  viewportRef: HTMLDivElement;
  trackRef: HTMLDivElement;
  caretRef: HTMLSpanElement;
} | null>(null);

const subWordElementsAtom = atomWithReset<{
  viewportRef: HTMLDivElement;
  trackRef: HTMLDivElement;
  caretRef: HTMLSpanElement;
} | null>(null);

export const readMainWordElements = () => store.get(mainWordElementsAtom);
store.sub(typingWordAtom, () => {
  const typingWord = store.get(typingWordAtom);
  const main = store.get(mainWordElementsAtom);
  const sub = store.get(subWordElementsAtom);

  if (main && sub) {
    const { correct } = updateWordDisplay(typingWord, main, sub);
    const { isSmoothScroll, mainWordScrollStart, subWordScrollStart } = readTypingOptions();

    applyScroll(main, sub, correct.kana, correct.roma, {
      isSmoothScroll,
      mainScrollStart: mainWordScrollStart,
      subScrollStart: subWordScrollStart,
    });
  }
});

store.sub(playingInputModeAtom, () => {
  const typingWord = store.get(typingWordAtom);
  const main = store.get(mainWordElementsAtom);
  const sub = store.get(subWordElementsAtom);

  if (main && sub) {
    updateWordDisplay(typingWord, main, sub);
  }
});
store.sub(wordDisplayAtom, () => {
  const typingWord = store.get(typingWordAtom);
  const main = store.get(mainWordElementsAtom);
  const sub = store.get(subWordElementsAtom);

  if (main && sub) {
    updateWordDisplay(typingWord, main, sub);
  }
});

export const setMainWordElements = (elements: ExtractAtomValue<typeof mainWordElementsAtom>) => {
  store.set(mainWordElementsAtom, elements);
};

export const setSubWordElements = (elements: ExtractAtomValue<typeof subWordElementsAtom>) => {
  store.set(subWordElementsAtom, elements);
};

const updateWordDisplay = (
  typingWord: TypingWord,
  main: {
    viewportRef: HTMLDivElement;
    trackRef: HTMLDivElement;
    caretRef: HTMLSpanElement;
  },
  sub: {
    viewportRef: HTMLDivElement;
    trackRef: HTMLDivElement;
    caretRef: HTMLSpanElement;
  },
) => {
  const { wordDisplay } = readTypingOptions();
  const { inputMode } = readUtilityParams();
  const isMainKana = wordDisplay.startsWith("KANA_") || inputMode === "kana";

  const correct = {
    kana: typingWord.correct.kana.replace(/ /g, "ˍ"),
    roma: typingWord.correct.roma.replace(/ /g, "ˍ"),
  };

  const nextChar = {
    kana: typingWord.nextChunk.kana.replace(/ /g, " "),
    roma: (typingWord.nextChunk.romaPatterns[0] ?? "").replace(/ /g, " "),
  };

  const remainWord = {
    kana: typingWord.wordChunks
      .map((chunk) => chunk.kana)
      .join("")
      .slice(0, 60)
      .replace(/ /g, " "),
    roma: typingWord.wordChunks
      .map((chunk) => chunk.romaPatterns[0])
      .join("")
      .slice(0, 60)
      .replace(/ /g, " "),
  };

  if (main?.trackRef) {
    const correctEl = main.trackRef.children[0];
    const nextCharEl = main.trackRef.children[1];
    const remainWordEl = main.trackRef.children[2];

    if (correctEl && nextCharEl && remainWordEl) {
      correctEl.textContent = isMainKana ? correct.kana : correct.roma;
      nextCharEl.textContent = isMainKana ? nextChar.kana : nextChar.roma;
      remainWordEl.textContent = isMainKana ? remainWord.kana : remainWord.roma;
    }
  }

  if (sub?.trackRef) {
    const correctEl = sub?.trackRef.children[0];
    const nextCharEl = sub?.trackRef.children[1];
    const remainWordEl = sub?.trackRef.children[2];

    if (correctEl && nextCharEl && remainWordEl) {
      correctEl.textContent = isMainKana ? correct.roma : correct.kana;
      nextCharEl.textContent = isMainKana ? nextChar.roma : nextChar.kana;
      remainWordEl.textContent = isMainKana ? remainWord.roma : remainWord.kana;
    }
  }

  return { correct, nextChar, remainWord };
};

let prevMainShift = -1;
let prevSubShift = -1;

const applyScroll = (
  mainRefs: {
    viewportRef: HTMLDivElement;
    trackRef: HTMLDivElement;
    caretRef: HTMLSpanElement;
  },
  subRefs: {
    viewportRef: HTMLDivElement;
    trackRef: HTMLDivElement;
    caretRef: HTMLSpanElement;
  },
  mainCorrect: string,
  subCorrect: string,
  options: { isSmoothScroll: boolean; mainScrollStart: number; subScrollStart: number },
) => {
  // 早期リターン：レイアウト計算を回避（即座に実行、キャンセル不可）
  if (mainCorrect.length === 0 && subCorrect.length === 0) {
    requestAnimationFrame(() => {
      mainRefs.trackRef.style.transition = "";
      mainRefs.trackRef.style.transform = "translate3d(0px, 0px, 0px)";
      prevMainShift = 0;
      subRefs.trackRef.style.transition = "";
      subRefs.trackRef.style.transform = "translate3d(0px, 0px, 0px)";
      prevSubShift = 0;
    });
    return;
  }

  const DURATION = options.isSmoothScroll ? 80 : 0;

  const SCROLL_TRANSITION = `transform ${DURATION}ms`;
  const MAIN_RIGHT_BOUND_RATIO = options.mainScrollStart / 100;
  const SUB_RIGHT_BOUND_RATIO = options.subScrollStart / 100;
  return requestDebouncedAnimationFrame("word-scroll", () => {
    const mainMeasurements =
      mainCorrect.length > 0
        ? {
            caretX: mainRefs.caretRef.offsetLeft,
            rightBound: Math.floor(mainRefs.viewportRef.clientWidth * MAIN_RIGHT_BOUND_RATIO),
          }
        : null;

    const subMeasurements =
      subCorrect.length > 0
        ? {
            caretX: subRefs.caretRef.offsetLeft,
            rightBound: Math.floor(subRefs.viewportRef.clientWidth * SUB_RIGHT_BOUND_RATIO),
          }
        : null;

    const mainShift = mainMeasurements
      ? mainMeasurements.caretX > mainMeasurements.rightBound
        ? Math.max(0, mainMeasurements.caretX - mainMeasurements.rightBound)
        : null
      : null;

    const subShift = subMeasurements
      ? subMeasurements.caretX > subMeasurements.rightBound
        ? Math.max(0, subMeasurements.caretX - subMeasurements.rightBound)
        : null
      : null;

    if (mainShift !== null && mainShift !== prevMainShift) {
      mainRefs.trackRef.style.transition = SCROLL_TRANSITION;
      mainRefs.trackRef.style.transform = `translate3d(${-mainShift}px, 0px, 0px)`;
      prevMainShift = mainShift;
    }

    if (subShift !== null && subShift !== prevSubShift) {
      subRefs.trackRef.style.transition = SCROLL_TRANSITION;
      subRefs.trackRef.style.transform = `translate3d(${-subShift}px, 0px, 0px)`;
      prevSubShift = subShift;
    }
  });
};
