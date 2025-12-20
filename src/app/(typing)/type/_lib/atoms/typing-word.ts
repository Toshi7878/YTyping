import { useAtomValue } from "jotai";
import { atom, type ExtractAtomValue } from "jotai/vanilla";
import { atomWithReset, RESET } from "jotai/vanilla/utils";
import { focusAtom } from "jotai-optics";
import {
  type BuiltMapLine,
  createDisplayWord,
  createTypingWord,
  replaceAllSpaceWithThreePerEmSpace,
  type TypingWord,
} from "lyrics-typing-engine";
import type { BuiltMapLineWithOption } from "@/lib/types";
import { requestDebouncedAnimationFrame } from "@/utils/debounced-animation-frame";
import { readTypingOptions, wordDisplayAtom } from "./hydrate";
import { readLineCount, readLineProgress } from "./ref";
import { playingInputModeAtom, readBuiltMap, readMediaSpeed, readUtilityParams } from "./state";
import { getTypeAtomStore } from "./store";

const store = getTypeAtomStore();

const nextLyricsAtom = atomWithReset({
  lyrics: "",
  kpm: "",
});
export const useNextLyricsState = () => useAtomValue(nextLyricsAtom, { store });
export const setNextLyrics = (line: BuiltMapLine) => {
  const typingOptions = readTypingOptions();
  const inputMode = store.get(playingInputModeAtom);
  const playSpeed = readMediaSpeed();
  const nextKpm = (inputMode === "roma" ? line.kpm.roma : line.kpm.kana) * playSpeed;
  store.set(nextLyricsAtom, () => {
    if (line.kanaLyrics) {
      return {
        lyrics: typingOptions.nextDisplay === "WORD" ? line.kanaLyrics : line.lyrics,
        kpm: nextKpm.toFixed(0),
      };
    }

    return RESET;
  });
};
export const resetNextLyrics = () => store.set(nextLyricsAtom, RESET);

const lineAtom = atomWithReset<{ typingWord: TypingWord; lyrics: string }>({
  typingWord: {
    correct: { kana: "", roma: "" },
    nextChunk: { kana: "", romaPatterns: [], point: 0, type: undefined },
    wordChunks: [{ kana: "", romaPatterns: [], point: 0, type: undefined }],
    wordChunksIndex: 1,
    tempRomaPatterns: undefined,
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
  nextWordRef: HTMLSpanElement;
} | null>(null);

const subWordElementsAtom = atomWithReset<{
  viewportRef: HTMLDivElement;
  trackRef: HTMLDivElement;
  caretRef: HTMLSpanElement;
  nextWordRef: HTMLSpanElement;
} | null>(null);

const wordContainerElementAtom = atom<HTMLDivElement | null>(null);

export const setWordContainerElement = (element: ExtractAtomValue<typeof wordContainerElementAtom>) => {
  store.set(wordContainerElementAtom, element);
};

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

// キャッシュ用変数を定義
let prevMainCorrect = "";
let prevMainNextChar = "";
let prevMainRemain = "";

let prevSubCorrect = "";
let prevSubNextChar = "";
let prevSubRemain = "";

const updateWordDisplay = (
  typingWord: TypingWord,
  main: {
    viewportRef: HTMLDivElement;
    trackRef: HTMLDivElement;
    caretRef: HTMLSpanElement;
    nextWordRef: HTMLSpanElement;
  },
  sub: {
    viewportRef: HTMLDivElement;
    trackRef: HTMLDivElement;
    caretRef: HTMLSpanElement;
    nextWordRef: HTMLSpanElement;
  },
) => {
  const { wordDisplay, lineCompletedDisplay } = readTypingOptions();
  const { inputMode } = readUtilityParams();
  const isMainKana = wordDisplay.startsWith("KANA_") || inputMode === "kana";
  const { correct, nextChar, remainWord } = createDisplayWord(typingWord, { remainWord: { maxLength: 60 } });

  const mainCorrectText = isMainKana ? correct.kana : correct.roma;
  const mainNextCharText = isMainKana ? nextChar.kana : nextChar.roma;
  const mainRemainText = isMainKana ? remainWord.kana : remainWord.roma;

  if (main?.trackRef) {
    const correctEl = main.trackRef.children[0];
    const nextCharEl = main.trackRef.children[1];
    const remainWordEl = main.trackRef.children[2];

    if (correctEl && nextCharEl && remainWordEl) {
      if (prevMainCorrect !== mainCorrectText) {
        correctEl.textContent = mainCorrectText;
        prevMainCorrect = mainCorrectText;
      }
      if (prevMainNextChar !== mainNextCharText) {
        nextCharEl.textContent = mainNextCharText;
        prevMainNextChar = mainNextCharText;
      }
      if (prevMainRemain !== mainRemainText) {
        remainWordEl.textContent = mainRemainText;
        prevMainRemain = mainRemainText;
      }
    }
  }

  if (sub?.trackRef) {
    const correctEl = sub?.trackRef.children[0];
    const nextCharEl = sub?.trackRef.children[1];
    const remainWordEl = sub?.trackRef.children[2];

    if (correctEl && nextCharEl && remainWordEl) {
      const subCorrectText = isMainKana ? correct.roma : correct.kana;
      const subNextCharText = isMainKana ? nextChar.roma : nextChar.kana;
      const subRemainText = isMainKana ? remainWord.roma : remainWord.kana;

      if (prevSubCorrect !== subCorrectText) {
        correctEl.textContent = subCorrectText;
        prevSubCorrect = subCorrectText;
      }
      if (prevSubNextChar !== subNextCharText) {
        nextCharEl.textContent = subNextCharText;
        prevSubNextChar = subNextCharText;
      }
      if (prevSubRemain !== subRemainText) {
        remainWordEl.textContent = subRemainText;
        prevSubRemain = subRemainText;
      }
    }
  }

  const isCompleted = !!correct.kana && !nextChar.kana;
  const isUpdateLine = !correct.kana;
  const wordContainer = store.get(wordContainerElementAtom);
  requestAnimationFrame(() => {
    if (isCompleted) {
      if (wordContainer) {
        wordContainer.classList.add("word-area-completed");
      }

      if (lineCompletedDisplay === "NEXT_WORD") {
        const builtMap = readBuiltMap();
        const count = readLineCount();
        const nextLine = builtMap?.lines[count + 1];
        if (nextLine && main && sub) {
          const { kanaLyrics, romaLyrics } = nextLine;
          main.nextWordRef.textContent = `\u200B${replaceAllSpaceWithThreePerEmSpace(isMainKana ? kanaLyrics : romaLyrics)}`;
          sub.nextWordRef.textContent = `\u200B${replaceAllSpaceWithThreePerEmSpace(isMainKana ? romaLyrics : kanaLyrics)}`;
          main.nextWordRef.classList.add("!block");
          sub.nextWordRef.classList.add("!block");
          main.viewportRef.classList.add("hidden");
          sub.viewportRef.classList.add("hidden");
        }
      } else {
        const mainCorrectEl = main.trackRef.children[0];
        const subCorrectEl = sub.trackRef.children[0];
        if (mainCorrectEl && subCorrectEl) {
          mainCorrectEl.classList.add("!text-word-completed");
          subCorrectEl.classList.add("!text-word-completed");
        }
      }
    } else if (isUpdateLine) {
      main.nextWordRef.textContent = "";
      sub.nextWordRef.textContent = "";

      main.nextWordRef.classList.remove("!block");
      sub.nextWordRef.classList.remove("!block");
      main.viewportRef.classList.remove("hidden");
      sub.viewportRef.classList.remove("hidden");
      wordContainer?.classList.remove("word-area-completed");

      const mainCorrectEl = main.trackRef.children[0];
      const subCorrectEl = sub.trackRef.children[0];
      if (mainCorrectEl && subCorrectEl) {
        mainCorrectEl.classList.remove("!text-word-completed");
        subCorrectEl.classList.remove("!text-word-completed");
      }
    }
  });

  return { correct, nextChar, remainWord };
};

let prevMainShift = -1;
let prevSubShift = -1;
let prevMainCorrectTextForScroll = "";
let prevSubCorrectTextForScroll = "";

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
  // 早期リターン：初期化（即座に実行）
  if (mainCorrect.length === 0 && subCorrect.length === 0) {
    // Write Only
    mainRefs.trackRef.style.transition = "";
    mainRefs.trackRef.style.transform = "translate3d(0px, 0px, 0px)";
    prevMainShift = 0;
    subRefs.trackRef.style.transition = "";
    subRefs.trackRef.style.transform = "translate3d(0px, 0px, 0px)";
    prevSubShift = 0;
    prevMainCorrectTextForScroll = "";
    prevSubCorrectTextForScroll = "";
    return;
  }

  const DURATION = options.isSmoothScroll ? 80 : 0;
  const SCROLL_TRANSITION = `transform ${DURATION}ms`;
  const MAIN_RIGHT_BOUND_RATIO = options.mainScrollStart / 100;
  const SUB_RIGHT_BOUND_RATIO = options.subScrollStart / 100;

  return requestDebouncedAnimationFrame("word-scroll", () => {
    // --- Phase 1: Read (Layout計測) ---
    // ここでDOMプロパティ(clientWidth, offsetLeft)を一気に読み取る
    // 書き込み(style変更)を行う前にすべて読み終えることが重要

    let mainShift: number | null = null;
    let subShift: number | null = null;

    const isMainTextChanged = prevMainCorrectTextForScroll !== mainCorrect;
    const isSubTextChanged = prevSubCorrectTextForScroll !== subCorrect;

    prevMainCorrectTextForScroll = mainCorrect;
    prevSubCorrectTextForScroll = subCorrect;

    if (mainCorrect.length > 0) {
      if (isMainTextChanged || prevMainShift === -1) {
        const caretX = mainRefs.caretRef.offsetLeft;
        const rightBound = Math.floor(mainRefs.viewportRef.clientWidth * MAIN_RIGHT_BOUND_RATIO);

        if (caretX > rightBound) {
          mainShift = Math.max(0, caretX - rightBound);
        }
      } else {
        mainShift = prevMainShift;
      }
    }

    if (subCorrect.length > 0) {
      if (isSubTextChanged || prevSubShift === -1) {
        const caretX = subRefs.caretRef.offsetLeft;
        const rightBound = Math.floor(subRefs.viewportRef.clientWidth * SUB_RIGHT_BOUND_RATIO);

        if (caretX > rightBound) {
          subShift = Math.max(0, caretX - rightBound);
        }
      } else {
        subShift = prevSubShift;
      }
    }

    // --- Phase 2: Write (DOM更新) ---
    // 計測結果に基づいてDOMを更新する
    // これ以降、DOMの読み取りは行わない

    if (mainShift !== null && mainShift !== prevMainShift) {
      mainRefs.trackRef.style.transition = SCROLL_TRANSITION;
      mainRefs.trackRef.style.transform = `translateX(${-mainShift}px)`;
      prevMainShift = mainShift;
    }

    if (subShift !== null && subShift !== prevSubShift) {
      subRefs.trackRef.style.transition = SCROLL_TRANSITION;
      subRefs.trackRef.style.transform = `translateX(${-subShift}px)`;
      prevSubShift = subShift;
    }
  });
};

export const resetWordCache = () => {
  prevMainCorrect = "";
  prevMainNextChar = "";
  prevMainRemain = "";
  prevSubCorrect = "";
  prevSubNextChar = "";
  prevSubRemain = "";
  prevMainCorrectTextForScroll = "";
  prevSubCorrectTextForScroll = "";
};
