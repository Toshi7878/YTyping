import { useMapTagsState } from "@/app/edit/atoms/stateAtoms";
import { CHOICE_TAGS } from "@/app/edit/ts/const/editDefaultValues";
import TagBadge from "./TagBadge";

const TagSuggestions = () => {
  const tags = useMapTagsState();

  return (
    <div className="flex flex-col flex-wrap">
      <div className="flex flex-row gap-3 flex-wrap">
        {CHOICE_TAGS.map((label, index) => {
          const isSelected = tags.some((tag) => tag.id === label);

          if (isSelected) {
            return null;
          } else {
            return <TagBadge key={index} label={label} bg="#4fd1c5" />;
          }
        })}
      </div>
    </div>
  );
};

export default TagSuggestions;
