import { Box, Card, CardBody, Flex, useTheme } from "@chakra-ui/react";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { ThemeColors } from "@/types";

import { EditorButtonsRef, EditorTabRef } from "@/app/edit/ts/type";
import {
  useEditAddLyricsTextAtom,
  useEditLineLyricsAtom,
  useEditWordConvertOptionAtom,
} from "@/app/edit/edit-atom/editAtom";
import EditorButtons from "./tab-editor-child/EditorButtons";
import EditorLineInput from "./tab-editor-child/EditorLineInput";
import { useRefs } from "@/app/edit/edit-contexts/refsProvider";
import EditorAddLyricsInput from "./tab-editor-child/EditorAddLyricsInput";
import AddTimeAdjust from "./tab-settings-shortcutlist-child/settings-child/AddTimeAdjust";
import { useDeleteTopLyricsText } from "@/app/edit/hooks/useEditAddLyricsTextHooks";

const TabEditor = forwardRef<EditorTabRef, unknown>((props, ref) => {
  const [isTimeInputValid, setIsTimeInputValid] = useState(false);
  const theme: ThemeColors = useTheme();

  const editorButtonsRef = useRef<EditorButtonsRef>(null);

  const { setRef } = useRefs();
  const lyrics = useEditLineLyricsAtom();
  const lyricsText = useEditAddLyricsTextAtom();
  const convertOption = useEditWordConvertOptionAtom();
  const deleteTopLyricsText = useDeleteTopLyricsText();

  useEffect(() => {
    if (ref && "current" in ref) {
      setRef("editorTabRef", ref.current!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lyricsText, lyrics, convertOption]);

  useImperativeHandle(ref, () => ({
    redoAddLyrics: () => {
      deleteTopLyricsText(lyrics, lyricsText);
    },
  }));

  return (
    <Card variant="filled" bg={theme.colors.card.bg} boxShadow="lg" color={theme.colors.card.color}>
      <CardBody py={4}>
        <Box display="flex" flexDirection="column" gap={1}>
          <EditorLineInput setIsTimeInputValid={setIsTimeInputValid} />

          <Flex justifyContent="space-between" alignItems="flex-end">
            <EditorButtons ref={editorButtonsRef} isTimeInputValid={isTimeInputValid} />
            <AddTimeAdjust />
          </Flex>

          <EditorAddLyricsInput />
        </Box>
      </CardBody>
    </Card>
  );
});

TabEditor.displayName = "EditorTab";

export default TabEditor;
