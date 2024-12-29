import { Box } from "@chakra-ui/react";
import TagInput from "./child/TagInput";
import TagSuggestions from "./child/TagSuggestions";
import GeminiTagSuggestions from "./child/GeminiTagSuggestions";

interface InfoTagProps {
  isGeminiLoading: boolean;
}

const InfoTag = (props: InfoTagProps) => {
  return (
    <Box display="flex" flexDirection="column" gap="5">
      <TagInput />
      <TagSuggestions />
      <GeminiTagSuggestions isGeminiLoading={props.isGeminiLoading} />
    </Box>
  );
};

export default InfoTag;
