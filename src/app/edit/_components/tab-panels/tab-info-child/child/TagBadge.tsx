import { useMapTagsState, useSetCanUpload, useSetMapTags } from "@/app/edit/_lib/atoms/stateAtoms";
import { TAG_MAX_LEN } from "@/app/edit/_lib/const";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/types";

interface TagBadgeProps {
  label: string;
  bg: string;
}
const TagBadge = (props: TagBadgeProps) => {
  const tags = useMapTagsState();
  const setTags = useSetMapTags();
  const setCanUpload = useSetCanUpload();

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
      className={`cursor-pointer rounded-lg text-sm normal-case opacity-70 hover:opacity-100`}
      style={{ backgroundColor: props.bg }}
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
