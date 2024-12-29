import { useEditAddLyricsTextAtom } from "@/app/edit/edit-atom/editAtom";
import { useSetAddLyrics } from "@/app/edit/hooks/useEditAddLyricsTextHooks";
import { useAddLyricsTextPasteEvents } from "@/app/edit/hooks/useEditPasteEventHooks";
import { ThemeColors } from "@/types";
import { Box, Textarea, useTheme } from "@chakra-ui/react";

const EditorAddLyricsInput = () => {
  const theme: ThemeColors = useTheme();
  const pasteEvent = useAddLyricsTextPasteEvents();
  const lyricsText = useEditAddLyricsTextAtom();
  const setAddLyrics = useSetAddLyrics();

  return (
    <Box display="flex" alignItems="center">
      <Textarea
        placeholder="ここから歌詞をまとめて追加できます"
        size="lg"
        id="add_lyrics_text"
        height="110px"
        value={lyricsText}
        bg={theme.colors.background.body}
        borderColor={`${theme.colors.border.card}80`}
        _focus={{
          borderColor: `${theme.colors.primary}`,
        }}
        onPaste={pasteEvent}
        onChange={(e) => setAddLyrics(e.target.value)}
      />
    </Box>
  );
};

export default EditorAddLyricsInput;
