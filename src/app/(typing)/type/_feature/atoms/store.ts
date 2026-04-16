import { createStore } from "jotai";

let store = createStore();
export const getTypingGameAtomStore = () => store;
export const resetTypingGameStore = () => {
 store = createStore()
}
