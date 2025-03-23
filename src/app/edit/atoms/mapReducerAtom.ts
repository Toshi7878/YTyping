import { MapLine } from "@/types/map";
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

export const mapReducerAtom = atomWithReducer<MapLine[], MapAction>(
  init,
  (prev: MapLine[], action: MapAction) => {
    switch (action.type) {
      case "add": {
        return [...prev, action.payload].sort((a, b) => parseFloat(a.time) - parseFloat(b.time));
      }

      case "update": {
        const newArray = [...prev];
        newArray[action.index] = action.payload;

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
  }
);

export const useMapState = () => useAtomValue(mapReducerAtom, { store });
export const useMapReducer = () => useSetAtom(mapReducerAtom, { store });
export const useMapStateRef = () => {
  return useAtomCallback(
    useCallback((get) => get(mapReducerAtom), []),
    { store }
  );
};
