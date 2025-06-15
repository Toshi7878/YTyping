"use client";

import { useEndLineIndex } from "@/app/edit/_lib/atoms/buttonDisableStateAtoms";
import { useReadMap } from "@/app/edit/_lib/atoms/mapReducerAtom";
import { usePlayer } from "@/app/edit/_lib/atoms/refAtoms";
import {
  useDirectEditIndexState,
  useIsYTStartedState,
  useLineReducer,
  useSelectIndexState,
  useSetDirectEditIndex,
  useSetOpenLineOptionDialogIndex,
  useSetSelectIndex,
  useSetTabName,
  useTimeCountState,
} from "@/app/edit/_lib/atoms/stateAtoms";
import { useLineUpdateButtonEvent } from "@/app/edit/_lib/hooks/useButtonEvents";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { MapLine } from "@/types/map";
import parse from "html-react-parser";
import { useRef } from "react";
import DirectEditLyricsInput from "./direct-edit/DirectEditLyricsInput";
import DirectEditTimeInput from "./direct-edit/DirectEditTimeInput";
import DirectEditWordInput from "./direct-edit/DirectEditWordInput";

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
        {directEditIndex === index ? (
          <DirectEditTimeInput directEditTimeInputRef={directEditTimeInputRef} editTime={line.time} />
        ) : (
          line.time
        )}
      </TableCell>
      <TableCell className="lyrics-cell border-accent border-l">
        {directEditIndex === index ? (
          <DirectEditLyricsInput directEditLyricsInputRef={directEditLyricsInputRef} />
        ) : (
          parse(line.lyrics)
        )}
      </TableCell>
      <TableCell className="word-cell border-accent border-l">
        {directEditIndex === index ? (
          <DirectEditWordInput directEditWordInputRef={directEditWordInputRef} />
        ) : (
          line.word
        )}
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

export default LineRow;
