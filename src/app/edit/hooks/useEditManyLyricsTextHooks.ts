import { useStore as useJotaiStore } from "jotai";
import {
  editLineLyricsAtom,
  editManyLyricsAtom,
  useLineInputReducer,
  useSetEditManyLyricsAtom,
} from "../edit-atom/editAtom";
import { useWordConvert } from "./useWordConvert";

export const useSetTopLyrics = () => {
  const editAtomStore = useJotaiStore();

  const lineInputReducer = useLineInputReducer();
  const wordConvert = useWordConvert();

  return async (newLyrics?: string) => {
    const lines = editAtomStore.get(editManyLyricsAtom).split("\n");
    const lyrics = newLyrics ?? lines[0];

    const word = await wordConvert(lyrics);
    lineInputReducer({ type: "set", payload: { lyrics, word } });
  };
};

export const useSetManyLyrics = () => {
  const setManyLyrics = useSetEditManyLyricsAtom();
  const setTopLyrics = useSetTopLyrics();
  const editAtomStore = useJotaiStore();

  return (newLyricsText: string) => {
    const lyrics = editAtomStore.get(editLineLyricsAtom);

    const lines = newLyricsText.split("\n");
    const topLyrics = lines[0];
    if (topLyrics !== lyrics) {
      setTopLyrics(topLyrics);
    }

    setManyLyrics(newLyricsText);
  };
};

export const useDeleteTopLyricsText = () => {
  const setLyricsText = useSetEditManyLyricsAtom();
  const setTopLyricsText = useSetTopLyrics();
  const editAtomStore = useJotaiStore();

  return (lyrics: string) => {
    const lyricsText = editAtomStore.get(editManyLyricsAtom);

    const lines = lyricsText.split("\n") || [];
    const topLine = lines[0];
    const newText = lines.slice(1).join("\n");

    if (lyrics === topLine) {
      setLyricsText(newText);
    }

    const newLyrics: string = (newText.split("\n") || [""])[0];
    setTopLyricsText(newLyrics);
  };
};
