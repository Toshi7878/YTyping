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
import { store, subscribeTypingGameStoreChange } from "./store";

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

let unsubscribeTypingWordDisplaySubs: (() => void) | undefined;

function bindTypingWordDisplaySubs() {
  unsubscribeTypingWordDisplaySubs?.();

  const u1 = store.sub(typingWordAtom, () => {
    const typingWord = store.get(typingWordAtom);
    const main = store.get(mainWordElementsAtom);
    const sub = store.get(subWordElementsAtom);

    if (main && sub) {
      const { correct } = updateWordDisplay(typingWord, main, sub);
      const { isSmoothScroll, mainWordScrollStart, subWordScrollStart } = getTypingOptions();

      applyScroll(main, sub, correct.kana, correct.roma, {
        isSmoothScroll,
        mainScrollStart: mainWordScrollStart,
        subScrollStart: subWordScrollStart,
      });
    }
  });

  const u2 = store.sub(playingInputModeAtom, () => {
    const typingWord = store.get(typingWordAtom);
    const main = store.get(mainWordElementsAtom);
    const sub = store.get(subWordElementsAtom);

    if (main && sub) {
      updateWordDisplay(typingWord, main, sub);
    }
  });

  unsubscribeTypingWordDisplaySubs = () => {
    u1();
    u2();
  };
}

bindTypingWordDisplaySubs();
subscribeTypingGameStoreChange(bindTypingWordDisplaySubs);

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
  const { wordDisplay, lineCompletedDisplay } = getTypingOptions();
  const inputMode = getPlayingInputMode();
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
    wordContainer?.classList.toggle("word-area-completed", isCompleted);

    if (isCompleted && lineCompletedDisplay === "NEXT_WORD") {
      const builtMap = getBuiltMap();
      const count = getLineCount();
      const nextLine = builtMap?.lines[count + 1];
      if (nextLine && main && sub) {
        const { kanaLyrics, romaLyrics } = nextLine;
        main.nextWordRef.textContent = `\u200B${replaceAllSpaceWithThreePerEmSpace(isMainKana ? kanaLyrics : romaLyrics)}`;
        sub.nextWordRef.textContent = `\u200B${replaceAllSpaceWithThreePerEmSpace(isMainKana ? romaLyrics : kanaLyrics)}`;
        main.nextWordRef.classList.toggle("!block", true);
        sub.nextWordRef.classList.toggle("!block", true);
        main.viewportRef.classList.toggle("hidden", true);
        sub.viewportRef.classList.toggle("hidden", true);
      }
    } else if (isUpdateLine) {
      main.nextWordRef.textContent = "";
      sub.nextWordRef.textContent = "";

      main.nextWordRef.classList.toggle("!block", false);
      sub.nextWordRef.classList.toggle("!block", false);
      main.viewportRef.classList.toggle("hidden", false);
      sub.viewportRef.classList.toggle("hidden", false);
    }

    const mainCorrectEl = main.trackRef.children[0];
    const subCorrectEl = sub.trackRef.children[0];
    if (mainCorrectEl && subCorrectEl) {
      mainCorrectEl.classList.toggle("!text-word-completed", isCompleted && lineCompletedDisplay !== "NEXT_WORD");
      subCorrectEl.classList.toggle("!text-word-completed", isCompleted && lineCompletedDisplay !== "NEXT_WORD");
    }
  });

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
