import { useMapTagsState, useSetCanUpload, useSetMapTags } from "@/app/edit/_lib/atoms/stateAtoms";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { VariantProps } from "class-variance-authority";

interface TagBadgeProps {
  label: string;
  variant?: VariantProps<typeof badgeVariants>["variant"];
}

const SuggestionTagBadge = ({ label, variant }: TagBadgeProps) => {
  const tags = useMapTagsState();
  const setTags = useSetMapTags();
  const setCanUpload = useSetCanUpload();

  const handleAddition = (tag: string) => {
    const isTagAdded = tags.some((addedTag) => addedTag === tag);

    if (!isTagAdded) {
      setCanUpload(true);
      setTags({ type: "add", payload: tag });
    }
  };
  return (
    <Badge
      className="cursor-pointer rounded-lg text-sm normal-case opacity-70 hover:opacity-100"
      variant={variant}
      onClick={() => handleAddition(label)}
    >
      {label}
    </Badge>
  );
};

export default SuggestionTagBadge;
