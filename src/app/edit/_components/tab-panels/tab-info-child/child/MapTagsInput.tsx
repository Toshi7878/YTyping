import { useMapTagsState, useSetMapTags } from "@/app/edit/_lib/atoms/stateAtoms";
import { TAG_MAX_LEN, TAG_MIN_LEN } from "@/app/edit/_lib/const";
import { TagInput as BaseTagInput } from "@/components/ui/input/tag-input";
import { Label } from "@/components/ui/label";

const MapTagsInput = () => {
  const tags = useMapTagsState();
  const setTags = useSetMapTags();

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
        onTagAdd={(tag) => setTags({ type: "add", payload: tag })}
        onTagRemove={(index) => setTags({ type: "delete", payload: tags[index] })}
        maxTags={TAG_MAX_LEN}
        enableDragDrop={true}
      />
    </div>
  );
};

export default MapTagsInput;
