import { LineEdit } from "@/types";
import { useLineInputReducer, useSetManyPhraseAtom } from "../edit-atom/editAtom";

export const useUndoLine = () => {
  const lineInputReducer = useLineInputReducer();
  const setLyricsText = useSetManyPhraseAtom();

  return (undoLine: LineEdit, ManyPhrase: string) => {
    //Ctrl + Zで戻す
    const lyrics = undoLine.lyrics;
    const lines = ManyPhrase?.split("\n") || [];
    lines.unshift(lyrics);
    const newText = lines.join("\n");
    setLyricsText(newText);

    const time = undoLine.time;
    const word = undoLine.word;
    lineInputReducer({ type: "set", payload: { time, lyrics, word } });
  };
};
