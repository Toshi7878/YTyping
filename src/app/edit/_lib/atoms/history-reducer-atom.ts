import { MapLine, MapLineEdit } from "@/types/map";
import { useSetAtom } from "jotai";
import { atomWithReducer, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { MapAddAction, MapDeleteAction, MapReplaceAllAction, MapUpdateAction } from "./map-reducer-atom";
import { getEditAtomStore } from "./store";

const store = getEditAtomStore();

type Add = { actionType: MapAddAction["type"]; data: MapLineEdit };
type Update = {
  actionType: MapUpdateAction["type"];
  data: {
    old: MapLine;
    new: MapLine;
    lineIndex: number;
  };
};
type Delete = { actionType: MapDeleteAction["type"]; data: MapLineEdit };
type ReplaceAll = {
  actionType: MapReplaceAllAction["type"];
  data: {
    old: MapLine[];
    new: MapLine[];
  };
};

type History = Add | Update | Delete | ReplaceAll;

const initialState = {
  past: [] as History[],
  present: null as History | null,
  future: [] as History[],
};
interface AddAction {
  type: "add";
  payload: History;
}

interface OtherAction {
  type: "undo" | "redo" | "reset";
}

const historyReducer = (prev: typeof initialState, action: AddAction | OtherAction): typeof initialState => {
  switch (action.type) {
    case "undo": {
      prev.future.push(prev.present!);
      if (prev.past.length > 0) {
        const previous = prev.past.pop();
        prev.present = previous!;
      } else {
        prev.present = null;
      }

      return prev;
    }

    case "redo": {
      if (prev.future.length > 0) {
        const next = prev.future.pop();
        prev.past.push(prev.present!);
        prev.present = next!;
      }

      return prev;
    }
    case "add": {
      if (prev.present !== null) {
        prev.past.push(prev.present);
      }
      prev.present = action.payload;
      prev.future = [];

      return prev;
    }

    case "reset": {
      prev.past = initialState.past;
      prev.future = initialState.future;
      prev.present = initialState.present;

      return prev;
    }
    default:
      return prev;
  }
};

const historyReducerAtom = atomWithReducer(initialState, historyReducer);

export const useHistoryReducer = () => useSetAtom(historyReducerAtom, { store });
export const useEditHistoryRef = () => {
  return useAtomCallback(
    useCallback((get) => get(historyReducerAtom), []),
    { store },
  );
};
