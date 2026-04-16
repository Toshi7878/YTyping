import { createStore } from "jotai";

export type TypingGameStore = ReturnType<typeof createStore>;

export let store: TypingGameStore = createStore();

let storeVersion = 0;
const storeChangeListeners = new Set<() => void>();

/** resetTypingGameStore 後に呼ばれる。Provider の再マウントと store.sub の張り直し用 */
export function subscribeTypingGameStoreChange(listener: () => void) {
  storeChangeListeners.add(listener);
  return () => {
    storeChangeListeners.delete(listener);
  };
}

export function getTypingGameStoreVersion() {
  return storeVersion;
}

export const resetTypingGameStore = () => {
  store = createStore();
  storeVersion++;
  for (const listener of storeChangeListeners) {
    listener();
  }
};
