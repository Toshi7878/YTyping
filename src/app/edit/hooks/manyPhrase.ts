import { useStore as useJotaiStore } from "jotai";
import { manyPhraseAtom, useLineInputReducer, useSetManyPhraseAtom } from "../edit-atom/editAtom";
import { useWordConverter } from "./useWordConverter";

export const usePickupTopPhrase = () => {
  const editAtomStore = useJotaiStore();
  const lineInputReducer = useLineInputReducer();
  const wordConvert = useWordConverter();

  return async () => {
    const topPhrase = editAtomStore.get(manyPhraseAtom).split("\n")[0];

    const word = await wordConvert(topPhrase);
    lineInputReducer({ type: "set", payload: { lyrics: topPhrase, word } });
  };
};

export const useDeleteAddingTopPhrase = () => {
  const setManyPhrase = useSetManyPhraseAtom();
  const editAtomStore = useJotaiStore();

  return (lyrics: string) => {
    const lines = editAtomStore.get(manyPhraseAtom).split("\n") || [];

    const firstLine = lines[0];

    if (lyrics === firstLine) {
      const newText = lines.slice(1).join("\n");

      setManyPhrase(newText);
    }
  };
};
