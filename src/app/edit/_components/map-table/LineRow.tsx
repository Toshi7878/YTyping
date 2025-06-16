"use client";

import { useEndLineIndex } from "@/app/edit/_lib/atoms/buttonDisableStateAtoms";
import { useReadMap } from "@/app/edit/_lib/atoms/mapReducerAtom";
import { usePlayer, useTimeInput } from "@/app/edit/_lib/atoms/refAtoms";
import {
  useDirectEditIndexState,
  useIsWordConvertingState,
  useIsYTStartedState,
  useLineReducer,
  useLyricsState,
  useSelectIndexState,
  useSetDirectEditIndex,
  useSetLyrics,
  useSetOpenLineOptionDialogIndex,
  useSetSelectIndex,
  useSetTabName,
  useSetWord,
  useTimeCountState,
  useWordState,
} from "@/app/edit/_lib/atoms/stateAtoms";
import { useAddRubyTagEvent } from "@/app/edit/_lib/hooks/useAddRubyTag";
import { useLineUpdateButtonEvent, useWordConvertButtonEvent } from "@/app/edit/_lib/hooks/useButtonEvents";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/input/floating-label-input";
import { TableCell, TableRow } from "@/components/ui/table";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { MapLine } from "@/types/map";
import parse from "html-react-parser";
import { useRef, useState } from "react";

interface LineRowProps {
  index: number;
  line: MapLine;
}

function LineRow({ line, index }: LineRowProps) {
  const directEditTimeInputRef = useRef<HTMLInputElement | null>(null);
  const directEditLyricsInputRef = useRef<HTMLInputElement | null>(null);
  const directEditWordInputRef = useRef<HTMLInputElement | null>(null);

  const directEditIndex = useDirectEditIndexState();
  const selectIndex = useSelectIndexState();
  const endLineIndex = useEndLineIndex();

  const setTabName = useSetTabName();
  const setSelectIndex = useSetSelectIndex();
  const setDirectEditIndex = useSetDirectEditIndex();
  const setSelectLine = useLineReducer();
  const lineUpdateButtonEvent = useLineUpdateButtonEvent();
  const isYTStarted = useIsYTStartedState();

  const { readPlayer } = usePlayer();
  const readMap = useReadMap();
  const setOpenLineOptionDialogIndex = useSetOpenLineOptionDialogIndex();
  const timeCount = useTimeCountState();

  const selectLine = (event: React.MouseEvent<HTMLTableRowElement>, selectIndex: number) => {
    const map = readMap();
    const { time, lyrics, word } = map[selectIndex];

    if (directEditIndex === selectIndex) {
      return null;
    }

    if (directEditIndex) {
      lineUpdateButtonEvent();
    }

    const isDirectEditMode = event.ctrlKey && selectIndex !== 0 && selectIndex !== endLineIndex;

    if (isDirectEditMode) {
      setDirectEditIndex(selectIndex);

      const cellClassName = (event.target as HTMLElement).classList[0];
      setTimeout(() => {
        switch (cellClassName) {
          case "time-cell":
            directEditTimeInputRef.current?.focus();
            break;
          case "lyrics-cell":
            directEditLyricsInputRef.current?.focus();
            break;
          case "word-cell":
            directEditWordInputRef.current?.focus();
            break;
        }
      }, 0);
    } else if (directEditIndex !== selectIndex) {
      setDirectEditIndex(null);
    }

    setSelectIndex(selectIndex);
    setSelectLine({ type: "set", line: { time, lyrics, word, selectIndex } });
  };

  const handleTimeClick = () => {
    if (directEditIndex !== index) {
      readPlayer().seekTo(Number(line.time), true);
    }
  };

  const isOptionEdited = Boolean(line.options?.isChangeCSS || line.options?.eternalCSS);

  return (
    <TableRow
      id={`line_${index}`}
      data-line-index={index}
      className={cn(
        "hover:bg-info/30 border-accent relative cursor-pointer border-b",
        isYTStarted && timeCount === index && "bg-success/30",
        selectIndex === index && "bg-info/80 hover:bg-info/80",
      )}
      onClick={(event) => {
        selectLine(event, index);
        setTabName("エディター");
      }}
    >
      <TableCell className="time-cell" onClick={handleTimeClick}>
        {directEditIndex === index ? <DirectTimeInput ref={directEditTimeInputRef} time={line.time} /> : line.time}
      </TableCell>
      <TableCell className="lyrics-cell border-accent border-l">
        {directEditIndex === index ? <DirectLyricsInput ref={directEditLyricsInputRef} /> : parse(line.lyrics)}
      </TableCell>
      <TableCell className="word-cell border-accent border-l">
        {directEditIndex === index ? <DirectWordInput ref={directEditWordInputRef} /> : line.word}
      </TableCell>
      <TableCell className="border-accent border-l">
        <Button
          disabled={index === endLineIndex}
          variant={isOptionEdited ? "success" : "outline"}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            if (index !== endLineIndex) {
              setOpenLineOptionDialogIndex(index);
            }
          }}
        >
          {isOptionEdited ? "設定有" : "未設定"}
        </Button>
      </TableCell>
    </TableRow>
  );
}

interface DirectEditTimeInputProps {
  ref: React.RefObject<HTMLInputElement | null>;
  time: string;
}

const DirectTimeInput = ({ ref, time }: DirectEditTimeInputProps) => {
  const [editTime, setEditTime] = useState(time);
  const { setTime } = useTimeInput();
  const { readPlayer } = usePlayer();

  return (
    <TooltipWrapper label={"↓↑: 0.05ずつ調整, Enter:再生"}>
      <FloatingLabelInput
        label="Time"
        ref={ref}
        className="h-6 text-xs"
        type="number"
        value={editTime}
        onChange={(e) => {
          const newValue = e.target.value;
          setEditTime(newValue);
          setTime(newValue);
        }}
        onKeyDown={(e) => {
          const value = e.currentTarget.value;

          if (e.code === "ArrowUp") {
            const newValue = (Number(value) - 0.05).toFixed(3);
            setEditTime(newValue);
            setTime(newValue);
            e.preventDefault();
          } else if (e.code === "ArrowDown") {
            const newValue = (Number(value) + 0.05).toFixed(3);
            setEditTime(newValue);
            setTime(newValue);
            e.preventDefault();
          } else if (e.code === "Enter") {
            readPlayer().seekTo(Number(value), true);
          }
        }}
      />
    </TooltipWrapper>
  );
};

const DirectLyricsInput = ({ ref }: { ref: React.RefObject<HTMLInputElement | null> }) => {
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
        ref={ref}
        label="歌詞"
        className="h-8"
        autoComplete="off"
        value={lyrics}
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

const DirectWordInput = ({ ref }: { ref: React.RefObject<HTMLInputElement | null> }) => {
  const isLoadWordConvert = useIsWordConvertingState();
  const selectWord = useWordState();
  const wordConvertButtonEvent = useWordConvertButtonEvent();
  const setWord = useSetWord();

  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        disabled={isLoadWordConvert}
        variant="outline"
        size="sm"
        className="hover:bg-secondary/40 h-8 w-[8%]"
        onClick={wordConvertButtonEvent}
      >
        {isLoadWordConvert ? <span className="loading loading-spinner loading-xs" /> : "変換"}
      </Button>
      <FloatingLabelInput
        label="ワード"
        ref={ref}
        className="h-8 w-[91%]"
        autoComplete="off"
        value={selectWord}
        onChange={(e) => setWord(e.target.value)}
      />
    </div>
  );
};

export default LineRow;
