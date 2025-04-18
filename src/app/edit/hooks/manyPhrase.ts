import { usePlayer } from "../atoms/refAtoms";
import {
  useEditUtilsStateRef,
  useLineReducer,
  useLineStateRef,
  useSetManyPhraseState,
  useSetWordState,
} from "../atoms/stateAtoms";
import { useWordConverter } from "./utils/useWordConverter";

export const usePickupTopPhrase = () => {
  const lineDispatch = useLineReducer();
  const { readPlayer } = usePlayer();
  const readSelectLine = useLineStateRef();
  const setWordState = useSetWordState();
  const readEditUtils = useEditUtilsStateRef();

  const wordConvert = useWordConverter();
  return async (topPhrase: string) => {
    const { directEditingIndex } = readEditUtils();
    if (directEditingIndex !== null) {
      return null;
    }

    lineDispatch({
      type: "set",
      line: { lyrics: topPhrase.trim(), word: "", selectIndex: null, time: readPlayer().getCurrentTime() },
    });

    const word = await wordConvert(topPhrase);

    const { lyrics } = readSelectLine();

    if (lyrics === topPhrase) {
      setWordState(word);
    }
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
