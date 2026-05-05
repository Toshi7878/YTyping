import { getDefaultStore, useAtomValue } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

const store = getDefaultStore();

const mapLinkModeAtom = atomWithStorage<"type" | "ime">(
  "mapLinkMode",
  "type",
  createJSONStorage(() => sessionStorage),
);
export const useMapLinkMode = () => useAtomValue(mapLinkModeAtom, { store });
export const getMapLinkMode = (): "type" | "ime" => {
  try {
    const stored = sessionStorage.getItem("mapLinkMode");
    const parsed = stored !== null ? JSON.parse(stored) : null;
    return parsed === "ime" ? "ime" : "type";
  } catch {
    return "type";
  }
};
export const setMapLinkMode = (value: "type" | "ime") => store.set(mapLinkModeAtom, value);
