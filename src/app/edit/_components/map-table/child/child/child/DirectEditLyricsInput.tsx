import { useLyricsState, useSetLyrics } from "@/app/edit/atoms/stateAtoms";
import { useAddRubyTagEvent } from "@/app/edit/hooks/utils/useAddRubyTag";
import { Input } from "@/components/ui/input/input";
import { TooltipWrapper } from "@/components/ui/tooltip";
import React, { useState } from "react";

interface DirectEditLyricsInputProps {
  directEditLyricsInputRef: React.RefObject<HTMLInputElement | null>;
}

const DirectEditLyricsInput = (props: DirectEditLyricsInputProps) => {
  const [isLineLyricsSelected, setIsLineLyricsSelected] = useState(false);
  const selectLyrics = useLyricsState();

  const setLyrics = useSetLyrics();
  const handleEnterAddRuby = useAddRubyTagEvent();

  return (
    <TooltipWrapper
      label={<span className="text-xs">Enterキーを押すとRubyタグを挿入できます。</span>}
      disabled={!isLineLyricsSelected}
      open={isLineLyricsSelected}
    >
      <Input
        ref={props.directEditLyricsInputRef}
        className="h-8"
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
    </TooltipWrapper>
  );
};

export default DirectEditLyricsInput;
