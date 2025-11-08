import { dispatchEditHistory, readEditHistory } from "../atoms/history-reducer";
import { setMapAction } from "../atoms/map-reducer";
import {
  dispatchLine,
  readUtilityParams,
  readYTPlayerStatus,
  seekYTPlayer,
  setManyPhrase,
  setWord,
} from "../atoms/state";
import { deleteTopPhrase, pickupTopPhrase } from "../editor/many-phrase";
import { wordConvert } from "../editor/typable-word-convert";

export const undo = async () => {
  const { present } = readEditHistory();

  if (present) {
    const { actionType, data } = present;
    switch (actionType) {
      case "add": {
        const { lineIndex, time, lyrics, word } = data;
        setMapAction({ type: "delete", index: lineIndex });
        const { speed } = readYTPlayerStatus();
        seekYTPlayer(Number(data.time) - 3 * speed);
        dispatchLine({ type: "set", line: { time, lyrics, word, selectIndex: null } });
        const { manyPhraseText } = readUtilityParams();
        setManyPhrase(`${lyrics}\n${manyPhraseText}`);

        if (!word) {
          const word = await wordConvert(lyrics);
          setWord(word);
        }
        break;
      }
      case "update":
        setMapAction({ type: "update", payload: data.old, index: data.lineIndex });
        break;
      case "delete":
        setMapAction({ type: "add", payload: data });
        break;
      case "replaceAll":
        setMapAction({ type: "replaceAll", payload: data.old });
        break;
    }
    dispatchEditHistory({ type: "undo" });
  }
};

export const redo = () => {
  const { future } = readEditHistory();

  const lastFuture = future.at(-1);
  if (lastFuture) {
    const { actionType, data } = lastFuture;

    switch (actionType) {
      case "add": {
        setMapAction({ type: "add", payload: data });
        deleteTopPhrase(data.lyrics);
        const { manyPhraseText } = readUtilityParams();
        const topPhrase = manyPhraseText.split("\n")[0] ?? "";
        void pickupTopPhrase(topPhrase);
        break;
      }
      case "update":
        setMapAction({ type: "update", payload: data.new, index: data.lineIndex });
        break;
      case "delete":
        setMapAction({ type: "delete", index: data.lineIndex });
        break;
      case "replaceAll":
        setMapAction({ type: "replaceAll", payload: data.new });
        break;
    }
    dispatchEditHistory({ type: "redo" });
  }
};
