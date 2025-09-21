import { useEditHistoryRef, useHistoryReducer } from "../atoms/history-reducer-atom";
import { useMapReducer, useReadMap } from "../atoms/map-reducer-atom";
import { usePlayer } from "../atoms/read-atoms";
import {
  useLineReducer,
  useReadEditUtils,
  useReadLine,
  useReadYtPlayerStatus,
  useSetManyPhrase,
} from "../atoms/state-atoms";
import { useDeleteTopPhrase, usePickupTopPhrase } from "./many-phrase";
import { mapTableScroll } from "./map-table-scroll";

export const useSeekNextPrev = () => {
  const lineDispatch = useLineReducer();

  const readEditUtils = useReadEditUtils();
  const readLineStatus = useReadLine();
  const { readPlayer } = usePlayer();
  const readMap = useReadMap();
  return (type: "next" | "prev") => {
    const { directEditingIndex } = readEditUtils();

    const { selectIndex } = readLineStatus();
    if (selectIndex !== null && !directEditingIndex) {
      const seekCount = selectIndex + (type === "next" ? 1 : -1);
      const seekLine = readMap()[seekCount];
      if (seekLine) {
        readPlayer().seekTo(Number(seekLine.time), true);
        lineDispatch({
          type: "set",
          line: {
            time: seekLine.time,
            lyrics: seekLine.lyrics,
            word: seekLine.word,
            selectIndex: seekCount,
          },
        });
        mapTableScroll({ rowIndex: seekCount });
      }
    }
  };
};

export const useUndoRedo = () => {
  const readHistory = useEditHistoryRef();
  const historyDispatch = useHistoryReducer();
  const mapDispatch = useMapReducer();
  const pickupTopPhrase = usePickupTopPhrase();
  const readEditUtils = useReadEditUtils();
  const deleteTopPhrase = useDeleteTopPhrase();
  const { readPlayer } = usePlayer();
  const lineDispatch = useLineReducer();
  const setManyPhrase = useSetManyPhrase();
  const readYtPlayerStatus = useReadYtPlayerStatus();

  const undo = () => {
    const { present } = readHistory();

    if (present) {
      const { actionType, data } = present;
      switch (actionType) {
        case "add":
          const { lineIndex, time, lyrics, word } = data;
          mapDispatch({ type: "delete", index: lineIndex });
          const { speed } = readYtPlayerStatus();
          readPlayer().seekTo(Number(data.time) - 3 * speed, true);
          lineDispatch({ type: "set", line: { time, lyrics, word, selectIndex: null } });
          const { manyPhraseText } = readEditUtils();
          setManyPhrase(`${data.lyrics}\n${manyPhraseText}`);
          break;
        case "update":
          mapDispatch({ type: "update", payload: data.old, index: data.lineIndex });
          break;
        case "delete":
          mapDispatch({ type: "add", payload: data });
          break;
        case "replaceAll":
          mapDispatch({ type: "replaceAll", payload: data.old });
          break;
      }
      historyDispatch({ type: "undo" });
    }
  };

  const redo = () => {
    const { future } = readHistory();

    if (future.length) {
      const { actionType, data } = future[future.length - 1];

      switch (actionType) {
        case "add":
          mapDispatch({ type: "add", payload: data });
          deleteTopPhrase(data.lyrics);
          const { manyPhraseText } = readEditUtils();
          const topPhrase = manyPhraseText.split("\n")[0];
          void pickupTopPhrase(topPhrase);
          break;
        case "update":
          mapDispatch({ type: "update", payload: data.new, index: data.lineIndex });
          break;
        case "delete":
          mapDispatch({ type: "delete", index: data.lineIndex });
          break;
        case "replaceAll":
          mapDispatch({ type: "replaceAll", payload: data.new });
          break;
      }
      historyDispatch({ type: "redo" });
    }
  };

  return { undo, redo };
};
