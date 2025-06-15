import { useMapTagsState, useSetCanUpload, useSetMapTags } from "@/app/edit/_lib/atoms/stateAtoms";
import { TAG_MAX_LEN, TAG_MIN_LEN } from "@/app/edit/_lib/const";
import { TagInput as BaseTagInput, TagInputTag } from "@/components/ui/input/tag-input";
import { Label } from "@/components/ui/label";
import { Tag } from "@/types";

const TagInput = () => {
  const tags = useMapTagsState();
  const setTags = useSetMapTags();
  const setCanUpload = useSetCanUpload();

  const suggestions: TagInputTag[] = [
    { id: "1", text: "公式MV", className: "" },
    { id: "2", text: "英語", className: "" },
  ];

  const handleDelete = (index: number) => {
    setCanUpload(true);
    const deleteTag = tags[index];
    setTags({ type: "delete", payload: deleteTag });
  };

  const handleAddition = (tag: TagInputTag) => {
    const isTagAdded = tags.some((existingTag) => existingTag.id === tag.id);

    if (!isTagAdded && tags.length < TAG_MAX_LEN) {
      setCanUpload(true);
      const newTag: Tag = {
        id: tag.id,
        text: tag.text,
        className: tag.className || "",
      };
      setTags({ type: "add", payload: newTag });
    }
  };

  const tagInputTags: TagInputTag[] = tags.map((tag) => ({
    id: tag.id,
    text: tag.text || tag.id,
    className: tag.className,
  }));

  return (
    <div className="flex items-center">
      <Label className="w-[150px] font-bold">
        <span>
          タグ {tags.length}
          {tags.length <= 1 ? `/${TAG_MIN_LEN}` : `/${TAG_MAX_LEN}`}
        </span>
      </Label>
      <BaseTagInput
        tags={tagInputTags}
        onTagAdd={handleAddition}
        onTagRemove={handleDelete}
        placeholder={tags.length <= 1 ? "タグを2つ以上追加してください" : "タグを追加"}
        maxTags={TAG_MAX_LEN}
        suggestions={suggestions}
        enableDragDrop={true}
        removeButtonAriaLabel="タグを削除"
        suggestionsLabel="提案:"
      />
    </div>
  );
};

export default TagInput;
