import { useMapTagsState, useSetCanUpload, useSetMapTags } from "@/app/edit/_lib/atoms/stateAtoms";
import { TAG_MAX_LEN, TAG_MIN_LEN } from "@/app/edit/_lib/const";
import { TagInput as BaseTagInput } from "@/components/ui/input/tag-input";
import { Label } from "@/components/ui/label";

const TagInput = () => {
  const tags = useMapTagsState();
  const setTags = useSetMapTags();
  const setCanUpload = useSetCanUpload();

  const handleDelete = (index: number) => {
    setCanUpload(true);
    setTags({ type: "delete", payload: tags[index] });
  };

  const handleAddition = (tag: string) => {
    if (tags.length < TAG_MAX_LEN) {
      setCanUpload(true);
      setTags({ type: "add", payload: tag });
    }
  };

  return (
    <div className="flex items-center">
      <Label className="w-[150px] font-bold">
        <span>
          タグ {tags.length}
          {tags.length <= 1 ? `/${TAG_MIN_LEN}` : `/${TAG_MAX_LEN}`}
        </span>
      </Label>
      <BaseTagInput
        tagVariant="primary-dark"
        tags={tags}
        onTagAdd={handleAddition}
        onTagRemove={handleDelete}
        placeholder={tags.length <= 1 ? "タグを2つ以上追加してください" : "タグを追加"}
        maxTags={TAG_MAX_LEN}
        enableDragDrop={true}
      />
    </div>
  );
};

export default TagInput;
