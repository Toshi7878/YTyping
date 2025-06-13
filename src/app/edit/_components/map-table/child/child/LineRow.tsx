"use client";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Dispatch, useCallback, useRef } from "react";

import { useEndLineIndex } from "@/app/edit/atoms/buttonDisableStateAtoms";
import { useReadMap } from "@/app/edit/atoms/mapReducerAtom";
import { usePlayer } from "@/app/edit/atoms/refAtoms";
import {
  useDirectEditIndexState,
  useLineReducer,
  useSetDirectEditIndex,
  useSetSelectIndex,
  useSetTabIndex,
} from "@/app/edit/atoms/stateAtoms";
import { useLineUpdateButtonEvent } from "@/app/edit/hooks/useButtonEvents";
import { useChangeLineRowColor } from "@/app/edit/hooks/utils/useChangeLineRowColor";
import { MapLine, MapLineEdit } from "@/types/map";
import parse from "html-react-parser";
import DirectEditLyricsInput from "./child/DirectEditLyricsInput";
import DirectEditTimeInput from "./child/DirectEditTimeInput";
import DirectEditWordInput from "./child/DirectEditWordInput";

interface LineRowProps {
  index: number;
  line: MapLine;
  onOpen: () => void;
  setOptionModalIndex: Dispatch<number>;
  setLineOptions: Dispatch<MapLineEdit["options"]>;
}

function LineRow({ line, index, onOpen, setOptionModalIndex, setLineOptions }: LineRowProps) {
  const directEditTimeInputRef = useRef<HTMLInputElement | null>(null);
  const directEditLyricsInputRef = useRef<HTMLInputElement | null>(null);
  const directEditWordInputRef = useRef<HTMLInputElement | null>(null);
  const directEditIndex = useDirectEditIndexState();
  const setTabIndex = useSetTabIndex();
  const setSelectedIndex = useSetSelectIndex();
  const setDirectEditIndex = useSetDirectEditIndex();
  const setSelectLine = useLineReducer();
  const endLineIndex = useEndLineIndex();

  const lineUpdateButtonEvent = useLineUpdateButtonEvent();
  const { allUpdateSelectColor } = useChangeLineRowColor();
  const { readPlayer } = usePlayer();
  const readMap = useReadMap();

  const selectLine = useCallback(
    (event: React.MouseEvent<HTMLTableRowElement>, selectIndex: number) => {
      const map = readMap();
      const time = map[selectIndex].time;
      const lyrics = map[selectIndex].lyrics;
      const word = map[selectIndex].word;

      if (directEditIndex === selectIndex) {
        return null;
      } else if (directEditIndex) {
        lineUpdateButtonEvent();
      }

      if (event.ctrlKey && selectIndex !== 0 && selectIndex !== endLineIndex) {
        setDirectEditIndex(selectIndex);

        const cellClassName = (event.target as HTMLElement).classList[0];
        setTimeout(() => {
          if (cellClassName === "time-cell") {
            directEditTimeInputRef.current?.focus();
          } else if (cellClassName === "lyrics-cell") {
            directEditLyricsInputRef.current?.focus();
          } else if (cellClassName === "word-cell") {
            directEditWordInputRef.current?.focus();
          }
        }, 0);
      } else if (directEditIndex !== selectIndex) {
        setDirectEditIndex(null);
      }

      setSelectedIndex(selectIndex);
      allUpdateSelectColor(selectIndex);
      setSelectLine({ type: "set", line: { time, lyrics, word, selectIndex } });
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [directEditIndex, endLineIndex]
  );

  const clickTimeCell = (event: React.MouseEvent<HTMLTableCellElement, MouseEvent>, index: number) => {
    if (directEditIndex !== index) {
      readPlayer().seekTo(Number(line.time), true);
    }
  };

  const isOptionEdited = line.options?.isChangeCSS || line.options?.eternalCSS;

  return (
    <TableRow
      id={`line_${index}`}
      data-line-index={index}
      className="cursor-pointer relative"
      onClick={(event) => {
        selectLine(event, index);
        setTabIndex(1);
      }}
    >
      <TableCell
        className={`time-cell border-r ${index !== endLineIndex ? 'border-b' : ''} ${directEditIndex === index ? 'px-2' : 'px-4'}`}
        onClick={(event) => clickTimeCell(event, index)}
      >
        {directEditIndex === index ? (
          <DirectEditTimeInput directEditTimeInputRef={directEditTimeInputRef as any} editTime={line.time} />
        ) : (
          line.time
        )}
      </TableCell>
      <TableCell
        className={`lyrics-cell border-r ${index !== endLineIndex ? 'border-b' : ''}`}
      >
        {directEditIndex === index ? (
          <DirectEditLyricsInput directEditLyricsInputRef={directEditLyricsInputRef as any} />
        ) : (
          parse(line.lyrics)
        )}
      </TableCell>
      <TableCell
        className={`word-cell border-r ${index !== endLineIndex ? 'border-b' : ''}`}
      >
        {directEditIndex === index ? (
          <DirectEditWordInput directEditWordInputRef={directEditWordInputRef as any} />
        ) : (
          line.word
        )}
      </TableCell>
      <TableCell
        className={index !== endLineIndex ? 'border-b' : ''}
      >
        <Button
          disabled={index === endLineIndex}
          variant={isOptionEdited ? "default" : "outline"}
          size="sm"
          onClick={() => {
            if (index !== endLineIndex) {
              setOptionModalIndex(index);
              setLineOptions(line.options);
              onOpen();
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
