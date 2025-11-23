import { dispatchEditHistory, readEditHistory } from "../atoms/history-reducer";
import { setRawMapAction } from "../atoms/map-reducer";
import {
  dispatchLine,
  getYTCurrentTime,
  readSelectLine,
  readUtilityParams,
  setManyPhrase,
  setWord,
} from "../atoms/state";
import { wordConvert } from "./typable-word-convert";

export const pickupTopPhrase = async (topPhrase: string) => {
  const { directEditingIndex } = readUtilityParams();
  if (directEditingIndex !== null) return null;

  dispatchLine({
    type: "set",
    line: { lyrics: topPhrase.trim(), word: "", selectIndex: null, time: getYTCurrentTime() ?? 0 },
  });

  const word = await wordConvert(topPhrase);

  const { lyrics } = readSelectLine();

  if (lyrics === topPhrase) {
    setWord(word);
    return;
  }

  const { present } = readEditHistory();
  if (present) {
    const { actionType, data } = present;
    if (actionType === "add") {
      if (data.lyrics === topPhrase) {
        const { lineIndex, ...line } = present.data;
        const newLine = { ...line, word };
        setRawMapAction({ type: "update", payload: newLine, index: lineIndex });
        dispatchEditHistory({ type: "overwrite", payload: { ...present, data: { ...present.data, word } } });
        return;
      }
    }
  }
};

export const deleteTopPhrase = (lyrics: string) => {
  const { manyPhraseText } = readUtilityParams();
  const lines = manyPhraseText.split("\n") || [];

  if (lyrics === lines[0]?.trim()) {
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
