import { LineEdit } from "@/types";
import { useLineInputReducer, useSetEditManyLyricsAtom } from "../edit-atom/editAtom";

export const useUndoLine = () => {
  const lineInputReducer = useLineInputReducer();
  const setLyricsText = useSetEditManyLyricsAtom();

  return (undoLine: LineEdit, ManyLyrics: string) => {
    //Ctrl + Zで戻す
    const lyrics = undoLine.lyrics;
    const lines = ManyLyrics?.split("\n") || [];
    lines.unshift(lyrics);
    const newText = lines.join("\n");
    setLyricsText(newText);

    const time = undoLine.time;
    const word = undoLine.word;
    lineInputReducer({ type: "set", payload: { time, lyrics, word } });
  };
};
