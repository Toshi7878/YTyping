"use client";

import { useEndLineIndex } from "@/app/edit/atoms/buttonDisableStateAtoms";
import { useReadMap } from "@/app/edit/atoms/mapReducerAtom";
import { usePlayer } from "@/app/edit/atoms/refAtoms";
import {
  useDirectEditIndexState,
  useLineReducer,
  useSetDirectEditIndex,
  useSetOpenLineOptionDialogIndex,
  useSetSelectIndex,
  useSetTabName,
} from "@/app/edit/atoms/stateAtoms";
import { useLineUpdateButtonEvent } from "@/app/edit/hooks/useButtonEvents";
import { useChangeLineRowColor } from "@/app/edit/hooks/utils/useChangeLineRowColor";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { MapLine } from "@/types/map";
import parse from "html-react-parser";
import { useRef } from "react";
import DirectEditLyricsInput from "./child/DirectEditLyricsInput";
import DirectEditTimeInput from "./child/DirectEditTimeInput";
import DirectEditWordInput from "./child/DirectEditWordInput";
import LineOptionModal from "../LineOptionModal";

interface LineRowProps {
  index: number;
  line: MapLine;
}

function LineRow({ line, index }: LineRowProps) {
  const directEditTimeInputRef = useRef<HTMLInputElement | null>(null);
  const directEditLyricsInputRef = useRef<HTMLInputElement | null>(null);
  const directEditWordInputRef = useRef<HTMLInputElement | null>(null);

  const directEditIndex = useDirectEditIndexState();
  const endLineIndex = useEndLineIndex();

  const setTabName = useSetTabName();
  const setSelectIndex = useSetSelectIndex();
  const setDirectEditIndex = useSetDirectEditIndex();
  const setSelectLine = useLineReducer();
  const lineUpdateButtonEvent = useLineUpdateButtonEvent();
  const { allUpdateSelectColor } = useChangeLineRowColor();
  const { readPlayer } = usePlayer();
  const readMap = useReadMap();
  const setOpenLineOptionDialogIndex = useSetOpenLineOptionDialogIndex();

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
    allUpdateSelectColor(selectIndex);
    setSelectLine({ type: "set", line: { time, lyrics, word, selectIndex } });
  };

  const handleTimeClick = () => {
    if (directEditIndex !== index) {
      readPlayer().seekTo(Number(line.time), true);
    }
  };

  const isOptionEdited = Boolean(line.options?.isChangeCSS || line.options?.eternalCSS);

  return (
    <>
      <TableRow
        id={`line_${index}`}
        data-line-index={index}
        className="relative cursor-pointer"
        onClick={(event) => {
          selectLine(event, index);
          setTabName("エディター");
        }}
      >
        <TableCell
          className={`time-cell border-r ${index !== endLineIndex ? "border-b" : ""} ${directEditIndex === index ? "px-2" : "px-4"}`}
          onClick={handleTimeClick}
        >
          {directEditIndex === index ? (
            <DirectEditTimeInput directEditTimeInputRef={directEditTimeInputRef} editTime={line.time} />
          ) : (
            line.time
          )}
        </TableCell>
        <TableCell className={`lyrics-cell ${index !== endLineIndex ? "border-b" : ""}`}>
          {directEditIndex === index ? (
            <DirectEditLyricsInput directEditLyricsInputRef={directEditLyricsInputRef} />
          ) : (
            parse(line.lyrics)
          )}
        </TableCell>
        <TableCell className={`word-cell border-r ${index !== endLineIndex ? "border-b" : ""}`}>
          {directEditIndex === index ? (
            <DirectEditWordInput directEditWordInputRef={directEditWordInputRef} />
          ) : (
            line.word
          )}
        </TableCell>
        <TableCell className={index !== endLineIndex ? "border-b" : ""}>
          <Button
            disabled={index === endLineIndex}
            variant={isOptionEdited ? "default" : "outline"}
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
        <LineOptionModal
        />
      )}
    </>
  );
}

export default LineRow;
