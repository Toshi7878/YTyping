import { useLyricsState, useSetLyrics } from "@/app/edit/atoms/stateAtoms";
import { useAddRubyTagEvent } from "@/app/edit/hooks/utils/useAddRubyTag";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { Box, Input } from "@chakra-ui/react";
import React, { useState } from "react";

interface DirectEditLyricsInputProps {
  directEditLyricsInputRef: React.RefObject<HTMLInputElement>;
}

const DirectEditLyricsInput = (props: DirectEditLyricsInputProps) => {
  const [isLineLyricsSelected, setIsLineLyricsSelected] = useState(false);
  const selectLyrics = useLyricsState();

  const setLyrics = useSetLyrics();
  const handleEnterAddRuby = useAddRubyTagEvent();

  return (
    <CustomToolTip
      label={<Box fontSize="xs">Enterキーを押すとRubyタグを挿入できます。</Box>}
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
