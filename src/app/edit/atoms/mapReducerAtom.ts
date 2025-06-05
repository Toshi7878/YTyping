import { MapLine } from "@/types/map";
import { normalizeSimilarSymbol } from "@/utils/parse-map/normalizeSimilarSymbol";
import { useAtomValue, useSetAtom } from "jotai";
import { atomWithReducer, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
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
      const normalizedLyrics = normalizeSimilarSymbol(lyrics);
      const normalizedWord = normalizeSimilarSymbol(word);

      return [...prev, { ...action.payload, lyrics: normalizedLyrics, word: normalizedWord }].sort(
        (a, b) => parseFloat(a.time) - parseFloat(b.time),
      );
    }

    case "update": {
      const newArray = [...prev];

      const { lyrics, word } = action.payload;
      const normalizedLyrics = normalizeSimilarSymbol(lyrics);
      const normalizedWord = normalizeSimilarSymbol(word);

      newArray[action.index] = { ...action.payload, lyrics: normalizedLyrics, word: normalizedWord };

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
export const useMapReducer = () => useSetAtom(mapReducerAtom, { store });
export const useReadMap = () => {
  return useAtomCallback(
    useCallback((get) => get(mapReducerAtom), []),
    { store },
  );
};
