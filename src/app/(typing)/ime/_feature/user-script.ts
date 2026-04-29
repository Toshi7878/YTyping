import { evaluateImeInput } from "lyrics-ime-typing-engine";
import { getBuiltMap, getTypingWord } from "../_lib/atoms/state";
import { getImeOptions } from "./provider";

type ImeEventMap = {
  start: undefined;
};
type ImeEventType = keyof ImeEventMap;
type ImeEventCallback<T extends ImeEventType> = (detail: ImeEventMap[T]) => void;

const eventListeners = new Map<ImeEventType, Set<ImeEventCallback<ImeEventType>>>();

export const dispatchImeEvent = <T extends ImeEventType>(type: T) => {
  eventListeners.get(type)?.forEach((cb) => {
    cb(undefined as ImeEventMap[T]);
  });
};

declare global {
  interface Window {
    __ytyping_ime: {
      /** IME 入力を評価する */
      evaluateImeInput: typeof evaluateImeInput;
      /** 現在の typing word（期待ワード・現在ワードインデックス）を取得 */
      getTypingWord: typeof getTypingWord;
      /** IME タイピングオプションを取得 */
      getImeOptions: typeof getImeOptions;
      /** ビルド済みマップ（譜面データ）を取得 */
      getBuiltMap: typeof getBuiltMap;
      /**
       * イベントリスナーを登録する
       * @example
       * window.__ytyping_ime.addEventListener("start", () => { ... });
       */
      addEventListener: <T extends ImeEventType>(type: T, callback: ImeEventCallback<T>) => void;
      /**
       * イベントリスナーを解除する
       * @example
       * const onStart = () => { ... };
       * window.__ytyping_ime.addEventListener("start", onStart);
       * window.__ytyping_ime.removeEventListener("start", onStart);
       */
      removeEventListener: <T extends ImeEventType>(type: T, callback: ImeEventCallback<T>) => void;
    };
  }
}

// SSR 時は window が存在しないため、クライアント側でのみ登録する
if (typeof window !== "undefined")
  window.__ytyping_ime = {
    get evaluateImeInput() {
      return evaluateImeInput;
    },
    get getTypingWord() {
      return getTypingWord;
    },
    get getImeOptions() {
      return getImeOptions;
    },
    get getBuiltMap() {
      return getBuiltMap;
    },
    addEventListener<T extends ImeEventType>(type: T, callback: ImeEventCallback<T>) {
      const listeners = eventListeners.get(type) ?? new Set<ImeEventCallback<ImeEventType>>();
      listeners.add(callback as ImeEventCallback<ImeEventType>);
      eventListeners.set(type, listeners);
    },

    removeEventListener<T extends ImeEventType>(type: T, callback: ImeEventCallback<T>) {
      eventListeners.get(type)?.delete(callback as ImeEventCallback<ImeEventType>);
    },
  };
