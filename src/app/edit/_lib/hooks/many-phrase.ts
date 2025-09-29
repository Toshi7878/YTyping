import { useHistoryReducer, useReadEditHistory } from "../atoms/history-reducer-atom";
import { useMapReducer } from "../atoms/map-reducer-atom";
import { usePlayer } from "../atoms/read-atoms";
import { useLineReducer, useReadEditUtils, useReadLine, useSetManyPhrase, useSetWord } from "../atoms/state-atoms";
import { useWordConverter } from "./use-word-converter";

export const usePickupTopPhrase = () => {
  const lineDispatch = useLineReducer();
  const { readPlayer } = usePlayer();
  const readSelectLine = useReadLine();
  const setWordState = useSetWord();
  const readEditUtils = useReadEditUtils();
  const readHistory = useReadEditHistory();
  const historyDispatch = useHistoryReducer();
  const mapDispatch = useMapReducer();

  const wordConvert = useWordConverter();
  return async (topPhrase: string) => {
    const { directEditingIndex } = readEditUtils();
    if (directEditingIndex !== null) {
      return null;
    }

    lineDispatch({
      type: "set",
      line: { lyrics: topPhrase.trim(), word: "", selectIndex: null, time: readPlayer().getCurrentTime() },
    });

    const word = await wordConvert(topPhrase);

    const { lyrics } = readSelectLine();

    if (lyrics === topPhrase) {
      setWordState(word);
      return;
    }

    const { present } = readHistory();
    if (present) {
      const { actionType, data } = present;
      if (actionType === "add") {
        if (data.lyrics === topPhrase) {
          const { lineIndex, ...line } = present.data;
          const newLine = { ...line, word };
          mapDispatch({ type: "update", payload: newLine, index: lineIndex });
          historyDispatch({ type: "overwrite", payload: { ...present, data: { ...present.data, word } } });
          return;
        }
      }
    }
  };
};

export const useDeleteTopPhrase = () => {
  const setManyPhrase = useSetManyPhrase();
  const readEditUtils = useReadEditUtils();

  return (lyrics: string) => {
    const { manyPhraseText } = readEditUtils();
    const lines = manyPhraseText.split("\n") || [];

    if (lyrics === lines[0].trim()) {
      const newManyPhrase = lines.slice(1).join("\n");

      setManyPhrase(newManyPhrase);
      setTimeout(() => {
        const textarea = document.getElementById("many_phrase_textarea");
        if (textarea) {
          textarea.scrollTop = 0;
        }
      });
    }
  };
};
