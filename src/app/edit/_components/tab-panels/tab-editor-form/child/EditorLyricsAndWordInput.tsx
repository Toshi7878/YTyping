import { useLyricsState, useSetLyrics, useSetWord, useWordState } from "@/app/edit/_lib/atoms/stateAtoms";
import { useAddRubyTagEvent } from "@/app/edit/_lib/hooks/useAddRubyTag";
import { FloatingLabelInput } from "@/components/ui/input/floating-label-input";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useState } from "react";

export const EditorLyricsInput = () => {
  const [isLineLyricsSelected, setIsLineLyricsSelected] = useState(false);
  const lyrics = useLyricsState();
  const setLyrics = useSetLyrics();
  const handleEnterAddRuby = useAddRubyTagEvent();

  return (
    <TooltipWrapper
      label={<span className="text-xs">Enterキーを押すとRubyタグを挿入できます。</span>}
      disabled={!isLineLyricsSelected}
      open={isLineLyricsSelected}
    >
      <FloatingLabelInput
        label="歌詞"
        className="h-8"
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
    </TooltipWrapper>
  );
};

export const EditorWordInput = () => {
  const word = useWordState();
  const setWord = useSetWord();

  return (
    <FloatingLabelInput
      label="ワード"
      className="h-8"
      autoComplete="off"
      value={word}
      onChange={(e) => setWord(e.target.value)}
    />
  );
};
