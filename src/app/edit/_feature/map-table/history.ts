import { atomWithReducer } from "jotai/utils";
import type { RawMapLine } from "@/validator/map/raw-map-json";
import { store } from "../provider";
import { wordConvertAction } from "../tabs/editor/button/word-convert";
import { dispatchLine, setWord } from "../tabs/editor/line-input";
import {
  deleteTopPhrase,
  getManyPhraseText,
  pickupTopPhrase,
  setManyPhraseText,
} from "../tabs/editor/many-phrase-textarea";
import { YTPlayer } from "../youtube-player";
import {
  type MapAddAction,
  type MapDeleteAction,
  type MapReplaceAllAction,
  type MapUpdateAction,
  setRawMapAction,
} from "./map-reducer";

type MapLineEdit = RawMapLine & {
  lineIndex: number;
};

type Add = { actionType: MapAddAction["type"]; data: MapLineEdit };
type Update = {
  actionType: MapUpdateAction["type"];
  data: {
    old: RawMapLine;
    new: RawMapLine;
    lineIndex: number;
  };
};
type Delete = { actionType: MapDeleteAction["type"]; data: MapLineEdit };
type ReplaceAll = {
  actionType: MapReplaceAllAction["type"];
  data: {
    old: RawMapLine[];
    new: RawMapLine[];
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
export const getMapEditHistory = () => store.get(historyReducerAtom);

export const undo = async () => {
  const { present } = getMapEditHistory();

  if (present) {
    const { actionType, data } = present;
    switch (actionType) {
      case "add": {
        const { lineIndex, time, lyrics, word } = data;
        setRawMapAction({ type: "delete", index: lineIndex });
        const mediaSpeed = YTPlayer.getSpeed();
        YTPlayer.seek(Number(data.time) - 3 * mediaSpeed);
        dispatchLine({ type: "set", line: { time, lyrics, word, selectIndex: null } });
        const manyPhraseText = getManyPhraseText();
        setManyPhraseText(`${lyrics}\n${manyPhraseText}`);

        if (!word) {
          const word = await wordConvertAction(lyrics);
          setWord(word);
        }
        break;
      }
      case "update":
        setRawMapAction({ type: "update", payload: data.old, index: data.lineIndex });
        break;
      case "delete":
        setRawMapAction({ type: "add", payload: data });
        break;
      case "replaceAll":
        setRawMapAction({ type: "replaceAll", payload: data.old });
        break;
    }
    dispatchEditHistory({ type: "undo" });
  }
};

export const redo = () => {
  const { future } = getMapEditHistory();

  const lastFuture = future.at(-1);
  if (lastFuture) {
    const { actionType, data } = lastFuture;

    switch (actionType) {
      case "add": {
        setRawMapAction({ type: "add", payload: data });
        deleteTopPhrase(data.lyrics);
        const manyPhraseText = getManyPhraseText();
        const topPhrase = manyPhraseText.split("\n")[0] ?? "";
        void pickupTopPhrase(topPhrase);
        break;
      }
      case "update":
        setRawMapAction({ type: "update", payload: data.new, index: data.lineIndex });
        break;
      case "delete":
        setRawMapAction({ type: "delete", index: data.lineIndex });
        break;
      case "replaceAll":
        setRawMapAction({ type: "replaceAll", payload: data.new });
        break;
    }
    dispatchEditHistory({ type: "redo" });
  }
};
