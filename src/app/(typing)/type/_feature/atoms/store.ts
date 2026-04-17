import { createStore } from "jotai";

export type TypingGameStore = ReturnType<typeof createStore>;

export const store: TypingGameStore = createStore();
