import { atomWithReducer } from "jotai/utils";
import type { MapLine } from "@/validator/map-json";
import type { MapAddAction, MapDeleteAction, MapReplaceAllAction, MapUpdateAction } from "./map-reducer";
import { getEditAtomStore } from "./store";

type MapLineEdit = MapLine & {
  lineIndex: number;
};

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
interface PayloadAction {
  type: "add" | "overwrite";
  payload: History;
}

interface OtherAction {
  type: "undo" | "redo" | "reset";
}

const historyReducer = (prev: typeof initialState, action: PayloadAction | OtherAction): typeof initialState => {
  switch (action.type) {
    case "undo": {
      if (!prev.present) return prev;

      prev.future.push(prev.present);
      if (prev.past.length > 0) {
        const previous = prev.past.pop();
        prev.present = previous ?? null;
      } else {
        prev.present = null;
      }

      return prev;
    }

    case "redo": {
      if (!prev.present) return prev;

      if (prev.future.length > 0) {
        const next = prev.future.pop();
        if (!next) prev;
        prev.past.push(prev.present);
        prev.present = next ?? null;
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

    case "overwrite": {
      prev.present = action.payload;
      return prev;
    }

    default:
      return prev;
  }
};

const historyReducerAtom = atomWithReducer(initialState, historyReducer);

export const dispatchEditHistory = (action: PayloadAction | OtherAction) => store.set(historyReducerAtom, action);
export const readEditHistory = () => store.get(historyReducerAtom);
