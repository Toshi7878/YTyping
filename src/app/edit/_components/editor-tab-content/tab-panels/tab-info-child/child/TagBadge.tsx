import { useSetCanUploadAtom, useSetTagsAtom, useTagsAtom } from "@/app/edit/edit-atom/editAtom";
import { TAG_MAX_LEN } from "@/app/edit/ts/const/editDefaultValues";
import { Tag } from "@/types";
import { Badge } from "@chakra-ui/react";
import React from "react";

interface TagBadgeProps {
  label: string;
  bg: string;
}
const TagBadge = (props: TagBadgeProps) => {
  const tags = useTagsAtom();
  const setTags = useSetTagsAtom();
  const setCanUpload = useSetCanUploadAtom();

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
    <Badge
      variant="solid"
      bg={props.bg}
      opacity="0.7"
      className={`cursor-pointer text-sm rounded-lg`}
      _hover={{ opacity: "1" }}
      textTransform="none" // 追加: UpperCaseを解除
      onClick={() => {
        if (tags.length < TAG_MAX_LEN) {
          handleAddition({ id: props.label, text: props.label, className: "" });
        }
      }}
    >
      {props.label}
    </Badge>
  );
};

export default TagBadge;
