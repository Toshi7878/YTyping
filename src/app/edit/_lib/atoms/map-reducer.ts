import { useAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import { normalizeSymbols } from "@/utils/string-transform";
import type { MapLine } from "@/validator/map-json";
import { getEditAtomStore } from "./store";

const store = getEditAtomStore();

export interface MapReplaceAllAction {
  type: "replaceAll";
  payload: MapLine[];
}

export interface MapAddAction {
  type: "add";
  payload: MapLine;
}

export interface MapUpdateAction {
  type: "update";
  payload: MapLine;
  index: number;
}

export interface MapDeleteAction {
  type: "delete";
  index: number;
}

type MapAction = MapAddAction | MapUpdateAction | MapDeleteAction | MapReplaceAllAction;
const init: MapLine[] = [{ time: "0", lyrics: "", word: "" }];
export const mapAtom = atomWithReset<MapLine[]>(init);

export const useMapState = () => useAtomValue(mapAtom, { store });
export const setMapAction = (action: MapAction) => {
  store.set(mapAtom, (prev) => {
    switch (action.type) {
      case "add": {
        const { lyrics, word } = action.payload;
        const normalizedWord = normalizeSymbols(word);
        return [...prev, { ...action.payload, lyrics, word: normalizedWord }].sort(
          (a, b) => parseFloat(a.time) - parseFloat(b.time),
        );
      }
      case "update": {
        const newArray = [...prev];
        const { lyrics, word, ...rest } = action.payload;
        const normalizedWord = normalizeSymbols(word);
        newArray[action.index] = { lyrics, word: normalizedWord, ...rest };
        return newArray.sort((a, b) => parseFloat(a.time) - parseFloat(b.time));
      }
      case "delete": {
        return prev.filter((_, lineIndex) => lineIndex !== action.index);
      }
      case "replaceAll": {
        return action.payload;
      }
    }
  });
};
export const resetMap = () => store.set(mapAtom, RESET);
export const readMap = () => store.get(mapAtom);
