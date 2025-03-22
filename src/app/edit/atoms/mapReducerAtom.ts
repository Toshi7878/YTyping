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

type MapAction = MapAddAction | MapUpdateAction | MapDeleteAction | MapReplaceAllAction;

export const mapReducerAtom = atomWithReducer<MapLine[], MapAction>(
  [
    {
      time: "0",
      lyrics: "",
      word: "",
    },
  ],
  (prev: MapLine[], action: MapAction) => {
    switch (action.type) {
      case "add": {
        return [...prev, action.payload].sort((a, b) => parseFloat(a.time) - parseFloat(b.time));
      }

      case "update": {
        if (action.index < 0 || action.index >= prev.length) {
          throw new Error("Invalid index for update action.");
        }

        prev[action.index] = action.payload;

        return prev.sort((a, b) => parseFloat(a.time) - parseFloat(b.time));
      }

      case "delete": {
        if (action.index === undefined || action.index < 0 || action.index >= prev.length) {
          throw new Error("Invalid index for delete action.");
        }

        return prev.filter((_, lineIndex) => lineIndex !== action.index);
      }

      case "replaceAll": {
        return action.payload;
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
