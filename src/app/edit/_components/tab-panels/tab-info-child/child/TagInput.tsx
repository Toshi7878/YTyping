import { useMapTagsState, useSetCanUpload, useSetMapTags } from "@/app/edit/_lib/atoms/stateAtoms";
import { TAG_MAX_LEN, TAG_MIN_LEN } from "@/app/edit/_lib/const";
import "@/app/edit/_lib/style/reactTags.scss";
import { Label } from "@/components/ui/label";
import { Tag } from "@/types";
import { WithContext as ReactTags, SEPARATORS } from "react-tag-input";

const TagInput = () => {
  const tags = useMapTagsState();
  const setTags = useSetMapTags();
  const setCanUpload = useSetCanUpload();

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
    <div
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
      className="flex items-center"
    >
      <Label className="w-[150px] font-bold">
        <span>
          タグ {tags.length}
          {tags.length <= 1 ? `/${TAG_MIN_LEN}` : `/${TAG_MAX_LEN}`}
        </span>
      </Label>
      <div className="w-full">
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
      </div>
    </div>
  );
};

export default TagInput;
