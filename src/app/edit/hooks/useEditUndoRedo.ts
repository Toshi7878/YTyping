import { LineEdit } from "@/types";
import { useLineInputReducer, useSetManyPhraseState } from "../atoms/stateAtoms";

export const useUndoLine = () => {
  const lineInputReducer = useLineInputReducer();
  const setManyPhrase = useSetManyPhraseState();

  return (undoLine: LineEdit, ManyPhrase: string) => {
    const lyrics = undoLine.lyrics;
    const lines = ManyPhrase?.split("\n") || [];
    lines.unshift(lyrics);
    const newManyPhrase = lines.join("\n");
    setManyPhrase(newManyPhrase);

    const time = undoLine.time;
    const word = undoLine.word;
    lineInputReducer({ type: "set", payload: { time, lyrics, word } });
  };
};
