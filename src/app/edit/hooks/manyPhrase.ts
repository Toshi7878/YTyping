import { usePlayer } from "../atoms/refAtoms";
import {
  useEditUtilsStateRef,
  useLineReducer,
  useSetLyricsState,
  useSetManyPhraseState,
  useSetWordState,
} from "../atoms/stateAtoms";
import { useWordConverter } from "./utils/useWordConverter";

export const usePickupTopPhrase = () => {
  const lineDispatch = useLineReducer();
  const setLyrics = useSetLyricsState();
  const setWord = useSetWordState();
  const { readPlayer } = usePlayer();

  const wordConvert = useWordConverter();
  return async (topPhrase: string) => {
    const word = await wordConvert(topPhrase);
    const time = readPlayer().getCurrentTime();
    lineDispatch({ type: "set", line: { lyrics: topPhrase, word, selectIndex: null, time } });
    setLyrics(topPhrase);
    setWord(word);
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
