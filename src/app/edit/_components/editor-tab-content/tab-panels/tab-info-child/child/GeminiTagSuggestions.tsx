import { Flex, Skeleton, Stack } from "@chakra-ui/react";
import { useGeminiTagsAtom, useTagsAtom } from "@/app/edit/edit-atom/editAtom";
import TagBadge from "./TagBadge";

interface GeminiTagSuggestionsProps {
  isGeminiLoading: boolean;
}

const GeminiTagSuggestions = (props: GeminiTagSuggestionsProps) => {
  const tags = useTagsAtom();
  const geminiTags = useGeminiTagsAtom();

  if (props.isGeminiLoading) {
    return (
      <Flex direction="column" wrap="wrap">
        <Stack direction="row" spacing={3} wrap="wrap">
          <Skeleton height="20px" width="100%" />;
        </Stack>
      </Flex>
    );
  } else {
    return (
      <Flex direction="column" wrap="wrap">
        <Stack direction="row" spacing={3} wrap="wrap">
          {geminiTags &&
            geminiTags.map((label, index) => {
              const isSelected = tags.some((tag) => tag.id === label);

              if (isSelected) {
                return "";
              } else {
                return <TagBadge key={index} label={label} bg="cyan.400" />;
              }
            })}
        </Stack>
      </Flex>
    );
  }
};

export default GeminiTagSuggestions;
