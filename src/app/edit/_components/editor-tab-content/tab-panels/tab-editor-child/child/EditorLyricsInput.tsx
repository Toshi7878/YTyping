import { useEditLineLyricsAtom, useSetEditLineLyricsAtom } from "@/app/edit/edit-atom/editAtom";
import { useAddRubyTagEvent } from "@/app/edit/hooks/useEditKeyDownEvents";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { ThemeColors } from "@/types";
import { Box, Input, useTheme } from "@chakra-ui/react";
import { useState } from "react";

const EditorLyricsInput = () => {
  const [isLineLyricsSelected, setIsLineLyricsSelected] = useState(false);
  const theme: ThemeColors = useTheme();

  const lyrics = useEditLineLyricsAtom();
  const setLyrics = useSetEditLineLyricsAtom();
  const handleEnterAddRuby = useAddRubyTagEvent();

  return (
    <CustomToolTip
      tooltipLabel={<Box fontSize="xs">Enterキーを押すとRubyタグを挿入できます。</Box>}
      placement="top"
      isDisabled={!isLineLyricsSelected}
      isOpen={isLineLyricsSelected}
    >
      <Input
        placeholder="歌詞"
        size="sm"
        autoComplete="off"
        value={lyrics}
        onChange={(e) => setLyrics(e.target.value)}
        bg={theme.colors.background.body}
        borderColor={`${theme.colors.border.card}60`}
        onKeyDown={handleEnterAddRuby}
        onSelect={(e) => {
          const start = e.currentTarget.selectionStart;
          const end = e.currentTarget.selectionEnd;
          const isSelected = end !== null && start !== null && end - start > 0;
          setIsLineLyricsSelected(isSelected);
        }}
        onBlur={() => setIsLineLyricsSelected(false)}
      />
    </CustomToolTip>
  );
};

export default EditorLyricsInput;
