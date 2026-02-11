import { useEffect, useRef, useState } from "react";
import { writeTimeInput } from "@/app/edit/_lib/atoms/ref";
import {
  setIsTimeInputValid,
  setLyrics,
  setWord,
  useLyricsState,
  useSelectIndexState,
  useWordState,
} from "@/app/edit/_lib/atoms/state";
import { handleEnterAddRuby } from "@/app/edit/_lib/editor/enter-add-ruby";
import { FloatingLabelInput } from "@/components/ui/input/floating-label-input";
import { Input } from "@/components/ui/input/input";
import { TooltipWrapper } from "@/components/ui/tooltip";

export const LyricsInput = () => {
  const [isLineLyricsSelected, setIsLineLyricsSelected] = useState(false);
  const lyrics = useLyricsState();

  return (
    <TooltipWrapper label="Enterキーを押すとRubyタグを挿入できます。" open={isLineLyricsSelected} asChild>
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

export const WordInput = () => {
  const word = useWordState();

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

export const SelectedLineIndex = () => {
  const selectedLineIndex = useSelectIndexState();
  return (
    <Input
      placeholder="No."
      className="h-8 w-[90px] bg-muted/50 opacity-100"
      readOnly
      value={selectedLineIndex ?? ""}
    />
  );
};

export const TimeInput = () => {
  const timeInputRef = useRef<HTMLInputElement>(null);
  const [time, setTime] = useState("0");

  useEffect(() => {
    if (timeInputRef.current) {
      writeTimeInput(timeInputRef.current);
    }
  }, []);

  return (
    <Input
      ref={timeInputRef}
      className="h-8 w-[90px]"
      type="number"
      value={time}
      onChange={(e) => {
        setTime(e.currentTarget.value);
        setIsTimeInputValid(e.currentTarget.value === "");
      }}
      onKeyDown={(e) => {
        const { value } = e.currentTarget;

        if (e.code === "ArrowDown") {
          const newValue = (Number(value) - 0.05).toFixed(3);
          e.currentTarget.value = newValue;
          e.preventDefault();
        } else if (e.code === "ArrowUp") {
          const newValue = (Number(value) + 0.05).toFixed(3);
          e.currentTarget.value = newValue;
          e.preventDefault();
        }
      }}
    />
  );
};
