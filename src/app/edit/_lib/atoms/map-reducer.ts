import { useAtomValue } from "jotai";
import { atomWithReducer } from "jotai/utils";
import type { MapLine } from "@/server/drizzle/validator/map-json";
import { normalizeSymbols } from "@/utils/string-transform";
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

interface MapResetAction {
  type: "reset";
}

type MapAction = MapAddAction | MapUpdateAction | MapDeleteAction | MapReplaceAllAction | MapResetAction;

const init = [
  {
    time: "0",
    lyrics: "",
    word: "",
  },
];

export const mapReducerAtom = atomWithReducer<MapLine[], MapAction>(init, (prev: MapLine[], action: MapAction) => {
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

    case "reset": {
      return init;
    }
  }
});

export const useMapState = () => useAtomValue(mapReducerAtom, { store });
export const mapAction = (action: MapAction) => store.set(mapReducerAtom, action);
export const readMap = () => store.get(mapReducerAtom);
