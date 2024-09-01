import { Box, Card, CardBody, useTheme } from "@chakra-ui/react";
import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { LineEdit, ThemeColors } from "@/types";
import { TextAreaEvents } from "@/app/edit/ts/tab/editor/textAreaEvent";

import { EditorButtonsRef, EditorTabRef } from "@/app/edit/ts/type";
import {
  useEditAddLyricsInputAtom,
  useEditLineLyricsAtom,
  useLineInputReducer,
  useSetEditAddLyricsInputAtom,
  useSetIsLoadWordConvertAtom,
} from "@/app/edit/edit-atom/editAtom";
import EditorButtons from "./tab-editor-child/EditorButtons";
import EditorLineInput from "./tab-editor-child/EditorLineInput";
import { useRefs } from "@/app/edit/edit-contexts/refsProvider";
import EditorAddLyricsInput from "./tab-editor-child/EditorAddLyricsInput";

const TabEditor = forwardRef<EditorTabRef, unknown>((props, ref) => {
  const [isTimeInputValid, setIsTimeInputValid] = useState(false);
  const theme: ThemeColors = useTheme();

  const editorButtonsRef = useRef<EditorButtonsRef>(null);

  const { editorTimeInputRef, editSettingsRef } = useRefs();
  const lyrics = useEditLineLyricsAtom();
  const lyricsText = useEditAddLyricsInputAtom();
  const setLyricsText = useSetEditAddLyricsInputAtom();
  const setIsLoadWordConvert = useSetIsLoadWordConvertAtom();
  const lineInputReducer = useLineInputReducer();

  useImperativeHandle(ref, () => ({
    undoAddLyrics: (undoLine: LineEdit) => {
      TextAreaEvents.undoTopLyrics(lineInputReducer, setLyricsText, undoLine, lyricsText);
      editorTimeInputRef.current!.undoAdd(undoLine.time);
    },

    redoAddLyrics: () => {
      const convertOption = editSettingsRef.current!.getWordConvertOption();

      TextAreaEvents.deleteTopLyrics(
        lineInputReducer,
        setLyricsText,
        lyrics,
        lyricsText,
        setIsLoadWordConvert,
        convertOption,
      );
    },
  }));

  return (
    <Card variant="filled" bg={theme.colors.card.bg} boxShadow="lg" color={theme.colors.card.color}>
      <CardBody py={4}>
        <Box display="flex" flexDirection="column" gap={1}>
          <EditorLineInput setIsTimeInputValid={setIsTimeInputValid} />
          <EditorButtons ref={editorButtonsRef} isTimeInputValid={isTimeInputValid} />
          <EditorAddLyricsInput />
        </Box>
      </CardBody>
    </Card>
  );
});

TabEditor.displayName = "EditorTab";

export default TabEditor;
