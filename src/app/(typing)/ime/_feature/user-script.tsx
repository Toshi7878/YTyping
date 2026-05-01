"use client";
import { evaluateImeInput, type WordResult } from "lyrics-ime-typing-engine";
import { getBuiltMap, getTargetWords } from "../_lib/atoms/state";
import { addNotifications } from "./notifications";
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

const ytypingIme = {
  get getBuiltMap() {
    return getBuiltMap;
  },
  get addNotifications() {
    return addNotifications;
  },
  get evaluateImeInput() {
    return ({
      value,
      currentWordIndex,
      wordResults,
    }: {
      value: string;
      currentWordIndex: number;
      wordResults: WordResult[];
    }) => {
      const map = getBuiltMap();
      if (!map) return;
      const targetWords = getTargetWords();
      const options = getImeOptions();

      return evaluateImeInput(value, { targetWords, currentWordIndex }, wordResults, map, options);
    };
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

declare global {
  interface Window {
    __ytyping_ime: typeof ytypingIme;
  }
}

// SSR 時は window が存在しないため、クライアント側でのみ登録する
if (typeof window !== "undefined") window.__ytyping_ime = ytypingIme;

export function UserScriptInit() {
  return null;
}
