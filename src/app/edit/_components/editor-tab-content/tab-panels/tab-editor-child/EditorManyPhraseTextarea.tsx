import {
  editLineLyricsAtom,
  useLineInputReducer,
  useManyPhraseAtom,
  useSetManyPhraseAtom,
} from "@/app/edit/edit-atom/editAtom";
import { usePickupTopPhrase } from "@/app/edit/hooks/manyPhrase";
import { useWordConverter } from "@/app/edit/hooks/useWordConverter";
import { ThemeColors } from "@/types";
import { Box, Textarea, useTheme } from "@chakra-ui/react";
import { useStore as useJotaiStore } from "jotai";
import { useCallback } from "react";

const EditorManyPhraseTextarea = () => {
  const theme: ThemeColors = useTheme();
  const manyPhrase = useManyPhraseAtom();
  const setManyPhrase = useSetManyPhraseAtom();
  const pickupTopPhrase = usePickupTopPhrase();
  const editAtomStore = useJotaiStore();
  const lineInputReducer = useLineInputReducer();
  const wordConverter = useWordConverter();

  const onChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const lyrics = editAtomStore.get(editLineLyricsAtom);

    const firstLine = e.target.value.split("\n")[0];
    if (firstLine !== lyrics) {
      pickupTopPhrase();
    }

    setManyPhrase(e.target.value);
  }, []);

  const onPaste = useCallback(async () => {
    setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.scrollTop = 0;
        document.activeElement.blur();
      }
    });

    const pasteManyPhrase = await navigator.clipboard.readText();
    const lines = pasteManyPhrase.split(/\r\n|\n/) || [];

    const topPhrase = lines[0];
    const word = await wordConverter(topPhrase);
    lineInputReducer({ type: "set", payload: { lyrics: topPhrase, word } });
  }, []);

  return (
    <Box display="flex" alignItems="center">
      <Textarea
        placeholder="ここから歌詞をまとめて追加できます"
        size="lg"
        id="many_phrase_textarea"
        height="110px"
        value={manyPhrase}
        bg={theme.colors.background.body}
        borderColor={`${theme.colors.border.card}80`}
        _focus={{
          borderColor: `${theme.colors.primary}`,
        }}
        onPaste={onPaste}
        onChange={onChange}
      />
    </Box>
  );
};

export default EditorManyPhraseTextarea;
