"use client";
import { Button, Td, Tr, UseDisclosureReturn, useTheme } from "@chakra-ui/react";
import { Dispatch, useCallback, useRef } from "react";

import { useEndLineIndex } from "@/app/edit/atoms/buttonDisableStateAtoms";
import { useMapStateRef } from "@/app/edit/atoms/mapReducerAtom";
import { usePlayer } from "@/app/edit/atoms/refAtoms";
import {
  useDirectEditIndexState,
  useLineReducer,
  useSetDirectEditIndexState,
  useSetSelectIndexState,
  useSetTabIndexState,
} from "@/app/edit/atoms/stateAtoms";
import { useLineUpdateButtonEvent } from "@/app/edit/hooks/useButtonEvents";
import { useChangeLineRowColor } from "@/app/edit/hooks/utils/useChangeLineRowColor";
import { ThemeColors } from "@/types";
import { MapLine, MapLineEdit } from "@/types/map";
import parse from "html-react-parser";
import DirectEditLyricsInput from "./child/DirectEditLyricsInput";
import DirectEditTimeInput from "./child/DirectEditTimeInput";
import DirectEditWordInput from "./child/DirectEditWordInput";

interface LineRowProps {
  index: number;
  line: MapLine;
  optionClosure: UseDisclosureReturn;
  setOptionModalIndex: Dispatch<number>;
  setLineOptions: Dispatch<MapLineEdit["options"]>;
}

function LineRow({ line, index, optionClosure, setOptionModalIndex, setLineOptions }: LineRowProps) {
  const directEditTimeInputRef = useRef<HTMLInputElement | null>(null);
  const directEditLyricsInputRef = useRef<HTMLInputElement | null>(null);
  const directEditWordInputRef = useRef<HTMLInputElement | null>(null);
  const directEditIndex = useDirectEditIndexState();
  const setTabIndex = useSetTabIndexState();
  const setSelectedIndex = useSetSelectIndexState();
  const setDirectEditIndex = useSetDirectEditIndexState();
  const setSelectLine = useLineReducer();
  const endLineIndex = useEndLineIndex();
  const theme: ThemeColors = useTheme();

  const lineUpdateButtonEvent = useLineUpdateButtonEvent();
  const { allUpdateSelectColor } = useChangeLineRowColor();
  const { readPlayer } = usePlayer();
  const readMap = useMapStateRef();

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
    <Tr
      id={`line_${index}`}
      data-line-index={index}
      cursor="pointer"
      position="relative"
      color={theme.colors.text.body}
      onClick={(event) => {
        selectLine(event, index);
        setTabIndex(1);
      }}
    >
      <Td
        borderBottom={index === endLineIndex ? "" : "1px solid"}
        borderRight="1px solid"
        borderRightColor={`${theme.colors.border.editorTable.right}`}
        borderBottomColor={theme.colors.border.editorTable.bottom}
        className="time-cell"
        onClick={(event) => clickTimeCell(event, index)}
        px={directEditIndex === index ? 2 : 4}
      >
        {directEditIndex === index ? (
          <DirectEditTimeInput directEditTimeInputRef={directEditTimeInputRef} editTime={line.time} />
        ) : (
          line.time
        )}
      </Td>
      <Td
        className="lyrics-cell"
        borderBottom={index === endLineIndex ? "" : "1px solid"}
        borderRight="1px solid"
        borderRightColor={`${theme.colors.border.editorTable.right}`}
        borderBottomColor={theme.colors.border.editorTable.bottom}
      >
        {directEditIndex === index ? (
          <DirectEditLyricsInput directEditLyricsInputRef={directEditLyricsInputRef} />
        ) : (
          parse(line.lyrics)
        )}
      </Td>
      <Td
        className="word-cell"
        borderBottom={index === endLineIndex ? "" : "1px solid"}
        borderBottomColor={theme.colors.border.editorTable.bottom}
        borderRight="1px solid"
        borderRightColor={`${theme.colors.border.editorTable.right}`}
      >
        {directEditIndex === index ? (
          <DirectEditWordInput directEditWordInputRef={directEditWordInputRef} />
        ) : (
          line.word
        )}
      </Td>
      <Td
        borderBottom={index === endLineIndex ? "" : "1px solid"}
        borderBottomColor={theme.colors.border.editorTable.bottom}
      >
        <Button
          disabled={index === endLineIndex}
          variant={isOptionEdited ? "solid" : "outline"}
          color={isOptionEdited ? theme.colors.text.body : theme.colors.secondary.main}
          bg={isOptionEdited ? theme.colors.secondary.main : ""}
          borderColor={isOptionEdited ? theme.colors.secondary.main : ""}
          _hover={{
            bg: isOptionEdited ? theme.colors.secondary.light : "",
          }}
          size="sm"
          onClick={() => {
            if (index !== endLineIndex) {
              setOptionModalIndex(index);
              setLineOptions(line.options);
              optionClosure.onOpen();
            }
          }}
        >
          {isOptionEdited ? "設定有" : "未設定"}
        </Button>
      </Td>
    </Tr>
  );
}

export default LineRow;
