import { Box } from "@chakra-ui/react";
import EditorLyricsInput from "./child/EditorLyricsInput";
import EditorSelectedLineCountInput from "./child/EditorSelectedLineCount";
import EditorTimeInput from "./child/EditorTimeInput";
import EditorWordInput from "./child/EditorWordInput";

const EditorLineInput = () => {
  return (
    <>
      <Box display="flex" alignItems="center">
        <EditorTimeInput />
        <EditorLyricsInput />
      </Box>
      <Box display="flex" alignItems="center">
        <EditorSelectedLineCountInput />
        <EditorWordInput />
      </Box>
    </>
  );
};

export default EditorLineInput;
