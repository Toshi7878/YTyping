import { useEditLineLyricsAtom, useSetEditLineLyricsAtom } from "@/app/edit/edit-atom/editAtom";
import { useAddRubyTagEvent } from "@/app/edit/hooks/useEditKeyDownEvents";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { ThemeColors } from "@/types";
import { Box, Input, useTheme } from "@chakra-ui/react";
import React, { useState } from "react";

interface DirectEditLyricsInputProps {
  directEditLyricsInputRef: React.RefObject<HTMLInputElement>;
}

const DirectEditLyricsInput = (props: DirectEditLyricsInputProps) => {
  const theme: ThemeColors = useTheme();

  const [isLineLyricsSelected, setIsLineLyricsSelected] = useState(false);
  const selectLyrics = useEditLineLyricsAtom();

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
        ref={props.directEditLyricsInputRef}
        size="sm"
        autoComplete="off"
        value={selectLyrics}
        onKeyDown={handleEnterAddRuby}
        bg={theme.colors.background.body}
        borderColor={`${theme.colors.border.card}60`}
        onChange={(e) => setLyrics(e.target.value)}
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

export default DirectEditLyricsInput;
