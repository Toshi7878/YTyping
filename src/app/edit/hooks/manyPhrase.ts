import { useEditUtilsStateRef, useLineInputReducer, useSetManyPhraseState } from "../atoms/stateAtoms";
import { useWordConverter } from "./useWordConverter";

export const usePickupTopPhrase = () => {
  const lineInputReducer = useLineInputReducer();
  const wordConvert = useWordConverter();
  const readEditUtils = useEditUtilsStateRef();
  return async () => {
    const topPhrase = readEditUtils().manyPhraseText.split("\n")[0];

    const word = await wordConvert(topPhrase);
    lineInputReducer({ type: "set", payload: { lyrics: topPhrase, word } });
  };
};

export const useDeleteAddingTopPhrase = () => {
  const setManyPhrase = useSetManyPhraseState();
  const readEditUtils = useEditUtilsStateRef();

  return (lyrics: string) => {
    const lines = readEditUtils().manyPhraseText.split("\n") || [];

    const firstLine = lines[0];

    if (lyrics === firstLine) {
      const newText = lines.slice(1).join("\n");

      setManyPhrase(newText);
    }
  };
};
