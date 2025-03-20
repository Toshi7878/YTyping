import { useMapTagsState, useSetCanUploadState, useSetMapTagsState } from "@/app/edit/atoms/stateAtoms";
import "@/app/edit/style/reactTags.scss";
import { TAG_MAX_LEN, TAG_MIN_LEN } from "@/app/edit/ts/const/editDefaultValues";
import { Tag } from "@/types";
import { Box, Flex, FormLabel, Text } from "@chakra-ui/react";
import { WithContext as ReactTags, SEPARATORS } from "react-tag-input";

const TagInput = () => {
  const tags = useMapTagsState();
  const setTags = useSetMapTagsState();
  const setCanUpload = useSetCanUploadState();

  const suggestions = [
    { id: "1", text: "公式MV", className: "" },
    { id: "2", text: "英語", className: "" },
  ];

  const handleDelete = (index: number) => {
    setCanUpload(true);
    const deleteTag = tags[index];
    setTags({ type: "delete", payload: deleteTag });
  };

  const handleAddition = (tag: Tag) => {
    tag.id = tag.id.trim();
    tag.text = tag.text.trim();

    const isTagAdded = tags.some((tags) => tags.id === tag.id);

    if (!isTagAdded) {
      setCanUpload(true);
      setTags({ type: "add", payload: tag });
    }
  };

  return (
    <Flex
      {...(tags.length !== 0
        ? {
            onDrop: (event) => {
              if (tags.length < TAG_MAX_LEN) {
                const text = event.dataTransfer.getData("text").replace(/\s/g, "");
                handleAddition({ id: text, text: text, className: "" });
              }
            },
          }
        : {})}
      alignItems="center"
    >
      <FormLabel mb="0" width="150px" fontWeight="bold">
        <Text as="span">
          タグ {tags.length}
          {tags.length <= 1 ? `/${TAG_MIN_LEN}` : `/${TAG_MAX_LEN}`}
        </Text>
      </FormLabel>
      <Box width={"100%"}>
        <ReactTags
          tags={tags}
          suggestions={suggestions}
          separators={[SEPARATORS.ENTER, SEPARATORS.COMMA]}
          placeholder={`${tags.length <= 1 ? "タグを2つ以上追加してください" : `タグを追加`}`}
          handleDelete={handleDelete}
          handleAddition={handleAddition}
          allowUnique
          autofocus={false}
          allowDragDrop={false}
          inputFieldPosition="inline"
          maxTags={TAG_MAX_LEN}
          handleInputChange={(value, event) => {
            //@ts-ignore
            if (event.nativeEvent.inputType === "insertFromDrop") {
              if (tags.length < TAG_MAX_LEN) {
                handleAddition({ id: value, text: value, className: "" });
                event.target.value = "";
              }
            }
          }}
          inline={false}
        />
      </Box>
    </Flex>
  );
};

export default TagInput;
