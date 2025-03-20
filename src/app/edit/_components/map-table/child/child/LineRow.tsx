"use client";
import { Button, Td, Tr, UseDisclosureReturn, useTheme } from "@chakra-ui/react";
import { Dispatch, useCallback, useRef } from "react";
import { useSelector } from "react-redux";

import { usePlayer } from "@/app/edit/atoms/refAtoms";
import {
  useDirectEditIndexState,
  useLineInputReducer,
  useSetDirectEditIndexState,
  useSetSelectedIndexState,
  useSetTabIndexState,
} from "@/app/edit/atoms/stateAtoms";
import { useLineUpdateButtonEvent } from "@/app/edit/hooks/useButtonEvents";
import { useChangeLineRowColor } from "@/app/edit/hooks/useChangeLineRowColor";
import { RootState } from "@/app/edit/redux/store";
import { LineEdit, ThemeColors } from "@/types";
import parse from "html-react-parser";
import DirectEditLyricsInput from "./child/DirectEditLyricsInput";
import DirectEditTimeInput from "./child/DirectEditTimeInput";
import DirectEditWordInput from "./child/DirectEditWordInput";

interface LineRowProps {
  index: number;
  line: LineEdit;
  optionClosure: UseDisclosureReturn;
  setOptionModalIndex: Dispatch<number>;
  setLineOptions: Dispatch<LineEdit["options"]>;
  endAfterLineIndex: number;
}

function LineRow({
  line,
  index,
  optionClosure,
  setOptionModalIndex,
  setLineOptions,
  endAfterLineIndex,
}: LineRowProps) {
  const directEditTimeInputRef = useRef<HTMLInputElement | null>(null);
  const directEditLyricsInputRef = useRef<HTMLInputElement | null>(null);
  const directEditWordInputRef = useRef<HTMLInputElement | null>(null);
  const directEditIndex = useDirectEditIndexState();
  const setTabIndex = useSetTabIndexState();
  const setSelectedIndex = useSetSelectedIndexState();
  const lineInputReducer = useLineInputReducer();
  const setDirectEditIndex = useSetDirectEditIndexState();
  const theme: ThemeColors = useTheme();
  const mapData = useSelector((state: RootState) => state.mapData.value);

  const lineUpdateButtonEvent = useLineUpdateButtonEvent();
  const { allUpdateSelectColor } = useChangeLineRowColor();
  const { readPlayer } = usePlayer();
  const selectLine = useCallback(
    (event: React.MouseEvent<HTMLTableRowElement>, selectCount: number) => {
      const time = mapData[selectCount].time;
      const lyrics = mapData[selectCount].lyrics;
      const word = mapData[selectCount].word;

      if (directEditIndex === selectCount) {
        return null;
      } else if (directEditIndex) {
        lineUpdateButtonEvent();
      }

      if (event.ctrlKey && selectCount !== 0 && selectCount !== endAfterLineIndex) {
        setDirectEditIndex(selectCount);

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
      } else if (directEditIndex !== selectCount) {
        setDirectEditIndex(null);
      }

      setSelectedIndex(selectCount);
      allUpdateSelectColor(selectCount);
      lineInputReducer({ type: "set", payload: { time, lyrics, word, selectCount } });
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mapData, directEditIndex, endAfterLineIndex]
  );

  const clickTimeCell = (event: React.MouseEvent<HTMLTableCellElement, MouseEvent>, index: number) => {
    if (directEditIndex !== index) {
      readPlayer().seekTo(Number(line.time), true);
    }
  };

  const isOptionEdited = line.options?.isChangeCSS || line.options?.eternalCSS;

  const isLastLine = mapData.length - 1 === index;
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
        borderBottom={isLastLine ? "" : "1px solid"}
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
        borderBottom={isLastLine ? "" : "1px solid"}
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
        borderBottom={isLastLine ? "" : "1px solid"}
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
        borderBottom={isLastLine ? "" : "1px solid"}
        borderBottomColor={theme.colors.border.editorTable.bottom}
      >
        <Button
          disabled={mapData.length - 1 === index}
          variant={isOptionEdited ? "solid" : "outline"}
          color={isOptionEdited ? theme.colors.text.body : theme.colors.secondary.main}
          bg={isOptionEdited ? theme.colors.secondary.main : ""}
          borderColor={isOptionEdited ? theme.colors.secondary.main : ""}
          _hover={{
            bg: isOptionEdited ? theme.colors.secondary.light : "",
          }}
          size="sm"
          onClick={() => {
            if (mapData.length - 1 !== index) {
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
