import { Flex, Stack } from "@chakra-ui/react";
import { useTagsAtom } from "@/app/edit/edit-atom/editAtom";
import { CHOICE_TAGS } from "@/app/edit/ts/const/editDefaultValues";
import TagBadge from "./TagBadge";

const TagSuggestions = () => {
  const tags = useTagsAtom();

  return (
    <Flex direction="column" wrap="wrap">
      <Stack direction="row" spacing={3} wrap="wrap">
        {CHOICE_TAGS.map((label, index) => {
          const isSelected = tags.some((tag) => tag.id === label);

          if (isSelected) {
            return "";
          } else {
            return <TagBadge key={index} label={label} bg="teal.400" />;
          }
        })}
      </Stack>
    </Flex>
  );
};

export default TagSuggestions;
