import { usePlayer } from "../atoms/refAtoms";
import { useEditUtilsStateRef, useLineReducer, useLineStateRef, useSetManyPhraseState } from "../atoms/stateAtoms";
import { useWordConverter } from "./utils/useWordConverter";

export const usePickupTopPhrase = () => {
  const lineDispatch = useLineReducer();
  const { readPlayer } = usePlayer();
  const readSelectLine = useLineStateRef();

  const wordConvert = useWordConverter();
  return async (topPhrase: string) => {
    const word = await wordConvert(topPhrase);
    const time = readPlayer().getCurrentTime();

    const { lyrics } = readSelectLine();
    if (topPhrase === lyrics)
      lineDispatch({ type: "set", line: { lyrics: topPhrase.trim(), word, selectIndex: null, time } });
  };
};

export const useDeleteAddingTopPhrase = () => {
  const setManyPhrase = useSetManyPhraseState();
  const readEditUtils = useEditUtilsStateRef();

  return (lyrics: string) => {
    const lines = readEditUtils().manyPhraseText.split("\n") || [];

    const firstLine = lines[0];

    if (lyrics === firstLine.trim()) {
      const newText = lines.slice(1).join("\n");

      setManyPhrase(newText);
      setTimeout(() => {
        const textarea = document.getElementById("many_phrase_textarea");
        if (textarea) {
          textarea.scrollTop = 0;
        }
      });
    }
  };
};
