import { useLyricsState, useSetLyrics } from "@/app/edit/atoms/stateAtoms";
import { useAddRubyTagEvent } from "@/app/edit/hooks/utils/useAddRubyTag";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { Input } from "@/components/ui/input/input";
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
      label={<span className="text-xs">Enterキーを押すとRubyタグを挿入できます。</span>}
      placement="top"
    >
      <Input
        ref={props.directEditLyricsInputRef}
        className="h-7 text-sm"
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
