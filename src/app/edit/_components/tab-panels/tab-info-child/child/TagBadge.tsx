import { useSetMapTags } from "@/app/edit/_lib/atoms/stateAtoms";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { VariantProps } from "class-variance-authority";

interface TagBadgeProps {
  label: string;
  variant?: VariantProps<typeof badgeVariants>["variant"];
}

const SuggestionTagBadge = ({ label, variant }: TagBadgeProps) => {
  const setTags = useSetMapTags();

  return (
    <Badge
      className="cursor-pointer rounded-lg text-sm opacity-70 hover:opacity-100"
      variant={variant}
      onClick={() => setTags({ type: "add", payload: label })}
    >
      {label}
    </Badge>
  );
};

export default SuggestionTagBadge;
