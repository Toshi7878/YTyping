import { useEditManyLyricsAtom } from "@/app/edit/edit-atom/editAtom";
import { useSetManyLyrics } from "@/app/edit/hooks/useEditManyLyricsTextHooks";
import { useManyLyricsTextPasteEvent } from "@/app/edit/hooks/useEditPasteEvent";
import { ThemeColors } from "@/types";
import { Box, Textarea, useTheme } from "@chakra-ui/react";

const EditorManyLyricsInput = () => {
  const theme: ThemeColors = useTheme();
  const pasteEvent = useManyLyricsTextPasteEvent();
  const manyLyrics = useEditManyLyricsAtom();
  const setManyLyrics = useSetManyLyrics();

  return (
    <Box display="flex" alignItems="center">
      <Textarea
        placeholder="ここから歌詞をまとめて追加できます"
        size="lg"
        id="many_lyrics_text"
        height="110px"
        value={manyLyrics}
        bg={theme.colors.background.body}
        borderColor={`${theme.colors.border.card}80`}
        _focus={{
          borderColor: `${theme.colors.primary}`,
        }}
        onPaste={pasteEvent}
        onChange={(e) => setManyLyrics(e.target.value)}
      />
    </Box>
  );
};

export default EditorManyLyricsInput;
