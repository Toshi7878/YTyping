import { LineEdit } from "@/types";
import { useLineInputReducer, useSetEditAddLyricsTextAtom } from "../edit-atom/editAtom";

export const useUndoLine = () => {
  const lineInputReducer = useLineInputReducer();
  const setLyricsText = useSetEditAddLyricsTextAtom();

  return (undoLine: LineEdit, addLyrics: string) => {
    //Ctrl + Zで戻す
    const lyrics = undoLine.lyrics;
    const lines = addLyrics?.split("\n") || [];
    lines.unshift(lyrics);
    const newText = lines.join("\n");
    setLyricsText(newText);

    const time = undoLine.time;
    const word = undoLine.word;
    lineInputReducer({ type: "set", payload: { time, lyrics, word } });
  };
};
