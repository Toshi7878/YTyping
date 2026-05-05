import { atom, type ExtractAtomValue, getDefaultStore, type SetStateAction, useAtomValue } from "jotai";
import { focusAtom } from "jotai-optics";
import { DEFAULT_USER_OPTIONS } from "@/server/drizzle/schema";

const store = getDefaultStore();

export const userOptionsAtom = atom(DEFAULT_USER_OPTIONS);
const presenceStateAtom = focusAtom(userOptionsAtom, (optic) => optic.prop("presenceState"));
const mapListLayoutAtom = focusAtom(userOptionsAtom, (optic) => optic.prop("mapListLayout"));
export const usePresenceOption = () => useAtomValue(presenceStateAtom, { store });
export const useMapListLayoutOption = () => useAtomValue(mapListLayoutAtom, { store });
export const setUserOptions = (update: SetStateAction<ExtractAtomValue<typeof userOptionsAtom>>) =>
  store.set(userOptionsAtom, update);
