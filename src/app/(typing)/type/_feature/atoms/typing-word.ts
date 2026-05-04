import { useAtomValue } from "jotai";
import { atom, type ExtractAtomValue } from "jotai/vanilla";
import { atomWithReset, RESET } from "jotai/vanilla/utils";
import {
  createDisplayWord,
  type InputMode,
  replaceAllSpaceWithThreePerEmSpace,
  type TypingWord,
} from "lyrics-typing-engine";
import { requestDebouncedAnimationFrame } from "@/utils/debounced-animation-frame";
import { getTypingOptions } from "../tabs/setting/popover";
import { getLineCount } from "../typing-card/playing/playing-scene";
import { getBuiltMap } from "./built-map";
import { store } from "./store";

const playingInputModeAtom = atom<InputMode>("roma");

export const usePlayingInputModeState = () => useAtomValue(playingInputModeAtom);
export const getPlayingInputMode = () => store.get(playingInputModeAtom);
export const setPlayingInputMode = (value: InputMode) => store.set(playingInputModeAtom, value);

const typingWordAtom = atomWithReset<TypingWord>({
  correct: { kana: "", roma: "" },
  nextChunk: { kana: "", romaPatterns: [], point: 0, type: undefined },
  wordChunks: [{ kana: "", romaPatterns: [], point: 0, type: undefined }],
  wordChunksIndex: 1,
  tempRomaPatterns: undefined,
});

export const setTypingWord = (value: TypingWord) => store.set(typingWordAtom, value);
export const getTypingWord = () => store.get(typingWordAtom);
export const resetTypingWord = () => store.set(typingWordAtom, RESET);

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

store.sub(typingWordAtom, () => {
  const typingWord = store.get(typingWordAtom);
  const main = store.get(mainWordElementsAtom);
  const sub = store.get(subWordElementsAtom);

  if (!main || !sub) return;

  const options = getTypingOptions();

  const { correct } = updateWordDisplay(typingWord, main, sub, options);

  applyScroll(main, sub, correct.kana, correct.roma, {
    isSmoothScroll: options.isSmoothScroll,
    mainScrollStart: options.mainWordScrollStart,
    subScrollStart: options.subWordScrollStart,
  });
});

store.sub(playingInputModeAtom, () => {
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
let prevIsCompleted = false;
let prevIsUpdateLine = false;
let prevLineCompletedDisplay = "";
let prevIsMainKana = false;
let prevNextLineCount = -1;
let prevMainNextWordText = "";
let prevSubNextWordText = "";

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
  options = getTypingOptions(),
) => {
  const { wordDisplay, lineCompletedDisplay } = options;
  const inputMode = getPlayingInputMode();

  const isMainKana = wordDisplay.startsWith("KANA_") || inputMode === "kana";

  const { correct, nextChar, remainWord } = createDisplayWord(typingWord, {
    remainWord: { maxLength: 60 },
  });

  const mainCorrectText = isMainKana ? correct.kana : correct.roma;
  const mainNextCharText = isMainKana ? nextChar.kana : nextChar.roma;
  const mainRemainText = isMainKana ? remainWord.kana : remainWord.roma;

  const subCorrectText = isMainKana ? correct.roma : correct.kana;
  const subNextCharText = isMainKana ? nextChar.roma : nextChar.kana;
  const subRemainText = isMainKana ? remainWord.roma : remainWord.kana;

  const mainCorrectEl = main.trackRef.children[0];
  const mainNextCharEl = main.trackRef.children[1];
  const mainRemainWordEl = main.trackRef.children[2];

  if (mainCorrectEl && prevMainCorrect !== mainCorrectText) {
    mainCorrectEl.textContent = mainCorrectText;
    prevMainCorrect = mainCorrectText;
  }

  if (mainNextCharEl && prevMainNextChar !== mainNextCharText) {
    mainNextCharEl.textContent = mainNextCharText;
    prevMainNextChar = mainNextCharText;
  }

  if (mainRemainWordEl && prevMainRemain !== mainRemainText) {
    mainRemainWordEl.textContent = mainRemainText;
    prevMainRemain = mainRemainText;
  }

  const subCorrectEl = sub.trackRef.children[0];
  const subNextCharEl = sub.trackRef.children[1];
  const subRemainWordEl = sub.trackRef.children[2];

  if (subCorrectEl && prevSubCorrect !== subCorrectText) {
    subCorrectEl.textContent = subCorrectText;
    prevSubCorrect = subCorrectText;
  }

  if (subNextCharEl && prevSubNextChar !== subNextCharText) {
    subNextCharEl.textContent = subNextCharText;
    prevSubNextChar = subNextCharText;
  }

  if (subRemainWordEl && prevSubRemain !== subRemainText) {
    subRemainWordEl.textContent = subRemainText;
    prevSubRemain = subRemainText;
  }

  const isCompleted = !!correct.kana && !nextChar.kana;
  const isUpdateLine = !correct.kana;

  const shouldUpdateCompletedView =
    prevIsCompleted !== isCompleted ||
    prevIsUpdateLine !== isUpdateLine ||
    prevLineCompletedDisplay !== lineCompletedDisplay ||
    prevIsMainKana !== isMainKana;

  if (shouldUpdateCompletedView) {
    prevIsCompleted = isCompleted;
    prevIsUpdateLine = isUpdateLine;
    prevLineCompletedDisplay = lineCompletedDisplay;
    prevIsMainKana = isMainKana;

    requestAnimationFrame(() => {
      const wordContainer = store.get(wordContainerElementAtom);

      wordContainer?.classList.toggle("word-area-completed", isCompleted);

      if (isCompleted && lineCompletedDisplay === "NEXT_WORD") {
        const builtMap = getBuiltMap();
        const count = getLineCount();
        const nextLine = builtMap?.lines[count + 1];

        if (nextLine && prevNextLineCount !== count) {
          prevNextLineCount = count;

          const { kanaLyrics, romaLyrics } = nextLine;

          const mainNextWordText = `\u200B${replaceAllSpaceWithThreePerEmSpace(isMainKana ? kanaLyrics : romaLyrics)}`;

          const subNextWordText = `\u200B${replaceAllSpaceWithThreePerEmSpace(isMainKana ? romaLyrics : kanaLyrics)}`;

          if (prevMainNextWordText !== mainNextWordText) {
            main.nextWordRef.textContent = mainNextWordText;
            prevMainNextWordText = mainNextWordText;
          }

          if (prevSubNextWordText !== subNextWordText) {
            sub.nextWordRef.textContent = subNextWordText;
            prevSubNextWordText = subNextWordText;
          }
        }

        main.nextWordRef.classList.toggle("!block", true);
        sub.nextWordRef.classList.toggle("!block", true);
        main.viewportRef.classList.toggle("hidden", true);
        sub.viewportRef.classList.toggle("hidden", true);
      } else if (isUpdateLine) {
        prevNextLineCount = -1;
        prevMainNextWordText = "";
        prevSubNextWordText = "";

        main.nextWordRef.textContent = "";
        sub.nextWordRef.textContent = "";

        main.nextWordRef.classList.toggle("!block", false);
        sub.nextWordRef.classList.toggle("!block", false);
        main.viewportRef.classList.toggle("hidden", false);
        sub.viewportRef.classList.toggle("hidden", false);
      }

      mainCorrectEl?.classList.toggle("!text-word-completed", isCompleted && lineCompletedDisplay !== "NEXT_WORD");

      subCorrectEl?.classList.toggle("!text-word-completed", isCompleted && lineCompletedDisplay !== "NEXT_WORD");
    });
  }

  return { correct };
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
