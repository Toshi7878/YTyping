import { useGeminiTagsState, useMapTagsState } from "@/app/edit/_lib/atoms/stateAtoms";
import { Skeleton } from "@/components/ui/skeleton";
import TagBadge from "./TagBadge";

interface GeminiTagSuggestionsProps {
  isGeminiLoading: boolean;
}

const GeminiTagSuggestions = (props: GeminiTagSuggestionsProps) => {
  const tags = useMapTagsState();
  const geminiTags = useGeminiTagsState();

  if (props.isGeminiLoading) {
    return (
      <div className="flex flex-col flex-wrap">
        <div className="flex flex-row flex-wrap gap-3">
          <Skeleton className="h-5 w-full" />
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col flex-wrap">
        <div className="flex flex-row flex-wrap gap-3">
          {geminiTags &&
            geminiTags.map((label, index) => {
              const isSelected = tags.some((tag) => tag.id === label);

              if (isSelected) {
                return null;
              } else {
                return <TagBadge key={index} label={label} bg="#00bcd4" />;
              }
            })}
        </div>
      </div>
    );
  }
};

export default GeminiTagSuggestions;
