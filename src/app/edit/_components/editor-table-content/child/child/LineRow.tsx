"use client";
import { Button, Td, Tr, UseDisclosureReturn, useTheme } from "@chakra-ui/react";
import { Dispatch, useCallback, useRef } from "react";
import { useSelector } from "react-redux";

import {
  useEditDirectEditCountAtom,
  useLineInputReducer,
  useSetEditDirectEditCountAtom,
  useSetEditLineSelectedCountAtom,
  useSetTabIndexAtom,
} from "@/app/edit/edit-atom/editAtom";
import { useRefs } from "@/app/edit/edit-contexts/refsProvider";
import { useLineUpdateButtonEvent } from "@/app/edit/hooks/useEditorButtonEvents";
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
  const setTabIndex = useSetTabIndexAtom();
  const setLineSelectedCount = useSetEditLineSelectedCountAtom();
  const lineInputReducer = useLineInputReducer();
  const directEdit = useEditDirectEditCountAtom();
  const setDirectEdit = useSetEditDirectEditCountAtom();
  const { playerRef, tbodyRef } = useRefs();
  const theme: ThemeColors = useTheme();
  const mapData = useSelector((state: RootState) => state.mapData.value);

  const lineUpdateButtonEvent = useLineUpdateButtonEvent();

  const selectLine = useCallback(
    (event: React.MouseEvent<HTMLTableRowElement>, selectCount: number) => {
      const time = mapData[selectCount].time;
      const lyrics = mapData[selectCount].lyrics;
      const word = mapData[selectCount].word;

      if (directEdit === selectCount) {
        return null;
      } else if (directEdit) {
        lineUpdateButtonEvent();
      }

      if (event.ctrlKey && selectCount !== 0 && selectCount !== endAfterLineIndex) {
        setDirectEdit(selectCount);

        const cellClassName = (event.target as HTMLElement).classList[0];
        setTimeout(() => {
          if (cellClassName === "time-cell") {
            directEditTimeInputRef.current?.focus(); // フォーカスを設定
          } else if (cellClassName === "lyrics-cell") {
            directEditLyricsInputRef.current?.focus(); // フォーカスを設定
          } else if (cellClassName === "word-cell") {
            directEditWordInputRef.current?.focus(); // フォーカスを設定
          }
        }, 0);
      } else if (directEdit !== selectCount) {
        setDirectEdit(null);
      }

      setLineSelectedCount(selectCount);
      const tbodyChildren = tbodyRef.current?.children;
      if (tbodyChildren) {
        for (let i = 0; i < tbodyChildren.length; i++) {
          const trElement = tbodyChildren[i] as HTMLElement;
          if (trElement.getAttribute("data-line-index") === String(selectCount)) {
            trElement.classList.add("selected-line");
          } else {
            trElement.classList.remove("selected-line");
          }
        }
      }
      lineInputReducer({ type: "set", payload: { time, lyrics, word, selectCount } });
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mapData, directEdit, endAfterLineIndex],
  );

  const clickTimeCell = (
    event: React.MouseEvent<HTMLTableCellElement, MouseEvent>,
    index: number,
  ) => {
    if (directEdit !== index) {
      playerRef.current.seekTo(line.time);
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
        px={directEdit === index ? 2 : 4}
      >
        {directEdit === index ? (
          <DirectEditTimeInput
            directEditTimeInputRef={directEditTimeInputRef}
            editTime={line.time}
          />
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
        {directEdit === index ? (
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
        {directEdit === index ? (
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
