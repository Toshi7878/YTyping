import { useLyricsState, useSetLyricsState } from "@/app/edit/atoms/stateAtoms";
import { useAddRubyTagEvent } from "@/app/edit/hooks/useKeyDown";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { Box, Input } from "@chakra-ui/react";
import { useState } from "react";

const EditorLyricsInput = () => {
  const [isLineLyricsSelected, setIsLineLyricsSelected] = useState(false);
  const lyrics = useLyricsState();
  const setLyrics = useSetLyricsState();
  const handleEnterAddRuby = useAddRubyTagEvent();

  return (
    <CustomToolTip
      label={<Box fontSize="xs">Enterキーを押すとRubyタグを挿入できます。</Box>}
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
