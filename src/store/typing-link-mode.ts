import { getDefaultStore, useAtomValue } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

const store = getDefaultStore();

const typingLinkModeAtom = atomWithStorage<"type" | "ime">(
  "typingLinkMode",
  "type",
  createJSONStorage<"type" | "ime">(() => sessionStorage),
);
export const useTypingLinkMode = () => useAtomValue(typingLinkModeAtom, { store });
export const setTypingLinkMode = (value: "type" | "ime") => store.set(typingLinkModeAtom, value);
