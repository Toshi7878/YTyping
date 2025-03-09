import { useStore as useJotaiStore } from "jotai";
import {
  editAddLyricsTextAtom,
  editLineLyricsAtom,
  useLineInputReducer,
  useSetEditAddLyricsTextAtom,
} from "../edit-atom/editAtom";
import { useWordConvert } from "./useWordConvert";

export function useSetTopLyricsText() {
  const editAtomStore = useJotaiStore();

  const lineInputReducer = useLineInputReducer();
  const wordConvert = useWordConvert();

  return async (newLyrics?: string | undefined) => {
    const lyricsText = editAtomStore.get(editAddLyricsTextAtom);

    const lines = lyricsText.split("\n");
    const lyrics = newLyrics === undefined ? lines[0].replace(/\r$/, "") : newLyrics;

    const word = await wordConvert(lyrics);

    lineInputReducer({ type: "set", payload: { lyrics, word } });
  };
}

export const useSetAddLyrics = () => {
  const setLyricsText = useSetEditAddLyricsTextAtom();
  const setTopLyricsText = useSetTopLyricsText();
  const editAtomStore = useJotaiStore();

  return (newLyricsText: string | null) => {
    if (newLyricsText !== null) {
      setLyricsText(newLyricsText);
    }

    const lyricsText = editAtomStore.get(editAddLyricsTextAtom);
    const lyrics = editAtomStore.get(editLineLyricsAtom);

    const lines = (newLyricsText !== null ? newLyricsText : lyricsText).split("\n");
    const topLyrics = lines[0].replace(/\r$/, "");
    if (topLyrics !== lyrics) {
      setTopLyricsText(topLyrics);
    }
  };
};

export const useDeleteTopLyricsText = () => {
  const setLyricsText = useSetEditAddLyricsTextAtom();
  const setTopLyricsText = useSetTopLyricsText();
  const editAtomStore = useJotaiStore();

  return (lyrics: string) => {
    const lyricsText = editAtomStore.get(editAddLyricsTextAtom);

    const lines = lyricsText.split("\n") || [];
    const topLine = lines[0];
    const newText = lines.slice(1).join("\n");

    if (lyrics.replace(/\r$/, "") === topLine) {
      setLyricsText(newText);
    }

    const newLyrics: string = (newText?.split("\n") || [""])[0];
    setTopLyricsText(newLyrics);
  };
};
