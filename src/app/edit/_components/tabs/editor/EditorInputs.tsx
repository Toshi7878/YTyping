import { useTimeInput } from "@/app/edit/_lib/atoms/refAtoms";
import {
  useLyricsState,
  useSelectIndexState,
  useSetIsTimeInputValid,
  useSetLyrics,
  useSetWord,
  useWordState,
} from "@/app/edit/_lib/atoms/stateAtoms";
import { useAddRubyTagEvent } from "@/app/edit/_lib/hooks/useAddRubyTag";
import { FloatingLabelInput } from "@/components/ui/input/floating-label-input";
import { Input } from "@/components/ui/input/input";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useEffect, useRef, useState } from "react";

const EditorLineInput = () => {
  return (
    <section>
      <div className="flex items-center">
        <TimeInput />
        <LyricsInput />
      </div>
      <div className="flex items-center">
        <SelectedLineIndex />
        <WordInput />
      </div>
    </section>
  );
};

const LyricsInput = () => {
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

const WordInput = () => {
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

const SelectedLineIndex = () => {
  const selectedLineIndex = useSelectIndexState();
  return (
    <Input placeholder="No." className="bg-muted h-8 w-[90px] opacity-100" disabled value={selectedLineIndex ?? ""} />
  );
};

const TimeInput = () => {
  const timeInputRef = useRef<HTMLInputElement>(null);
  const setEditIsTimeInputValid = useSetIsTimeInputValid();
  const { writeTimeInput } = useTimeInput();
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
        setEditIsTimeInputValid(e.currentTarget.value ? false : true);
      }}
      onKeyDown={(e) => {
        const value = e.currentTarget.value;

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

export default EditorLineInput;
