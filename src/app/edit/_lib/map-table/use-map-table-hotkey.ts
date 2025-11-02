import { useHistoryReducer, useReadEditHistory } from "../atoms/history-reducer-atom";
import { useMapReducer, useReadMap } from "../atoms/map-reducer-atom";
import { usePlayer } from "../atoms/read-atoms";
import {
  useLineReducer,
  useReadEditUtils,
  useReadLine,
  useReadYtPlayerStatus,
  useSetManyPhrase,
  useSetWord,
} from "../atoms/state-atoms";
import { useWordConverter } from "../editor/typable-word-converter";
import { useDeleteTopPhrase, usePickupTopPhrase } from "../editor/use-many-phrase";
import { scrollMapTable } from "./scroll-map-table";

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
        scrollMapTable({ rowIndex: seekCount });
      }
    }
  };
};

export const useUndoRedo = () => {
  const readHistory = useReadEditHistory();
  const historyDispatch = useHistoryReducer();
  const mapDispatch = useMapReducer();
  const pickupTopPhrase = usePickupTopPhrase();
  const readEditUtils = useReadEditUtils();
  const deleteTopPhrase = useDeleteTopPhrase();
  const { readPlayer } = usePlayer();
  const lineDispatch = useLineReducer();
  const setManyPhrase = useSetManyPhrase();
  const readYtPlayerStatus = useReadYtPlayerStatus();
  const wordConvert = useWordConverter();
  const setWord = useSetWord();

  const undo = async () => {
    const { present } = readHistory();

    if (present) {
      const { actionType, data } = present;
      switch (actionType) {
        case "add": {
          const { lineIndex, time, lyrics, word } = data;
          mapDispatch({ type: "delete", index: lineIndex });
          const { speed } = readYtPlayerStatus();
          readPlayer().seekTo(Number(data.time) - 3 * speed, true);
          lineDispatch({ type: "set", line: { time, lyrics, word, selectIndex: null } });
          const { manyPhraseText } = readEditUtils();
          setManyPhrase(`${lyrics}\n${manyPhraseText}`);

          if (!word) {
            const word = await wordConvert(lyrics);
            setWord(word);
          }
          break;
        }
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

    const lastFuture = future.at(-1);
    if (lastFuture) {
      const { actionType, data } = lastFuture;

      switch (actionType) {
        case "add": {
          mapDispatch({ type: "add", payload: data });
          deleteTopPhrase(data.lyrics);
          const { manyPhraseText } = readEditUtils();
          const topPhrase = manyPhraseText.split("\n")[0] ?? "";
          void pickupTopPhrase(topPhrase);
          break;
        }
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
